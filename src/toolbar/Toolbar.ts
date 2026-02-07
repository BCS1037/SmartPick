// SmartPick Toolbar - Main toolbar controller

import { Editor, MarkdownView } from 'obsidian';
import type SmartPickPlugin from '../main';
import { ToolbarUI } from './ToolbarUI';

export class Toolbar {
  private plugin: SmartPickPlugin;
  private ui: ToolbarUI;
  private isVisible: boolean = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private currentEditor: Editor | null = null;
  private currentSelection: string = '';
  private watchedEditorEl: HTMLElement | null = null;

  constructor(plugin: SmartPickPlugin) {
    this.plugin = plugin;
    this.ui = new ToolbarUI(plugin, this);
  }

  init(): void {
    // Register selection change listener
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('active-leaf-change', () => {
        this.hide();
        this.attachEditorListeners();
      })
    );

    // Initial attach
    this.attachEditorListeners();

    // Global ESC listener
    document.addEventListener('keydown', this.handleKeyDown);

    // Click outside listener
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  private attachEditorListeners(): void {
    // Cleanup previous listeners
    if (this.watchedEditorEl) {
      this.watchedEditorEl.removeEventListener('mouseup', this.handleSelectionChange);
      this.watchedEditorEl.removeEventListener('keyup', this.handleSelectionChange);
      this.watchedEditorEl = null;
    }

    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    const editor = view.editor;
    if (!editor) return;

    // Listen to selection changes via DOM
    const editorEl = (view.contentEl as HTMLElement).querySelector('.cm-content');
    if (editorEl) {
      this.watchedEditorEl = editorEl as HTMLElement;
      this.watchedEditorEl.addEventListener('mouseup', this.handleSelectionChange);
      this.watchedEditorEl.addEventListener('keyup', this.handleSelectionChange);
    }
  }

  private handleSelectionChange = (): void => {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Fixed 200ms delay as requested
    this.debounceTimer = setTimeout(() => {
      this.checkSelection();
    }, 200);
  };

  private checkSelection(): void {
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this.hide();
      return;
    }

    const editor = view.editor;
    const selection = editor.getSelection();

    if (selection && selection.toString().trim().length > 0) {
      this.currentEditor = editor;
      this.currentSelection = selection.toString();
      this.show(editor, view);
    } else {
      this.hide();
    }
  }

  private show(editor: Editor, view: MarkdownView): void {
    const pos = this.getSelectionCoords(editor, view);
    
    if (pos) {
      this.ui.show(pos);
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.isVisible) {
      this.ui.hide();
      this.isVisible = false;
    }
  }

  private getSelectionCoords(
    editor: Editor, 
    view: MarkdownView
  ): { left: number; top: number; right: number; bottom: number, width: number } | null {
    try {
      // Interface for accessing internal CodeMirror 6 editor
      interface EditorWithCM {
        cm?: {
          coordsAtPos(pos: number, bias?: number): { left: number; right: number; top: number; bottom: number } | null;
        };
      }
      const cmEditor = (editor as unknown as EditorWithCM).cm;
      
      if (!cmEditor) return null;

      const selection = editor.listSelections()[0];
      if (!selection) return null;

      const headOffset = editor.posToOffset(selection.head);
      const anchorOffset = editor.posToOffset(selection.anchor);
      
      const startOffset = Math.min(headOffset, anchorOffset);
      const endOffset = Math.max(headOffset, anchorOffset);

      const startCoords = cmEditor.coordsAtPos(startOffset);
      const endCoords = cmEditor.coordsAtPos(endOffset, -1);
      
      if (!startCoords || !endCoords) return null;

      const containerRect = view.contentEl.getBoundingClientRect();
      
      // Calculate relative coordinates
      return {
        left: startCoords.left - containerRect.left,
        top: startCoords.top - containerRect.top,
        right: endCoords.right - containerRect.left,
        bottom: endCoords.bottom - containerRect.top,
        width: containerRect.width
      };
    } catch {
      return null;
    }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  };

  private handleClickOutside = (e: MouseEvent): void => {
    if (!this.isVisible) return;
    
    const target = e.target as HTMLElement;
    if (!target.closest('.smartpick-toolbar')) {
      this.hide();
    }
  };

  getCurrentSelection(): string {
    return this.currentSelection;
  }

  getCurrentEditor(): Editor | null {
    return this.currentEditor;
  }

  destroy(): void {
    if (this.watchedEditorEl) {
      this.watchedEditorEl.removeEventListener('mouseup', this.handleSelectionChange);
      this.watchedEditorEl.removeEventListener('keyup', this.handleSelectionChange);
      this.watchedEditorEl = null;
    }
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('mousedown', this.handleClickOutside);
    this.ui.destroy();
  }
}
