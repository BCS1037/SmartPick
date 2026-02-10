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
  private hasSelection: boolean = false;

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
      this.watchedEditorEl.removeEventListener('dblclick', this.handleDoubleClick);
      this.watchedEditorEl = null;
    }

    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    const editor = view.editor;
    if (!editor) return;

    // Listen to selection changes via DOM
    const editorEl = view.contentEl.querySelector('.cm-content');
    if (editorEl) {
      this.watchedEditorEl = editorEl as HTMLElement;
      this.watchedEditorEl.addEventListener('mouseup', this.handleSelectionChange);
      this.watchedEditorEl.addEventListener('keyup', this.handleSelectionChange);
      this.watchedEditorEl.addEventListener('dblclick', this.handleDoubleClick);
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

  private handleDoubleClick = (e: MouseEvent): void => {
    // Check if double-click trigger is enabled
    if (!this.plugin.settings.enableDoubleClickTrigger) return;

    // Don't trigger if clicking on the toolbar itself
    const target = e.target as HTMLElement;
    if (target.closest('.smartpick-toolbar')) return;

    // Cancel any pending selection check to avoid conflict
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Use a short delay to let the browser's native double-click selection complete
    setTimeout(() => {
      this.showAtCurrentPosition();
    }, 50);
  };

  private showAtCurrentPosition(): void {
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    const editor = view.editor;
    this.currentEditor = editor;

    const selection = editor.getSelection();
    if (selection && selection.trim().length > 0) {
      // Double-click selected a word — show toolbar with selection
      this.currentSelection = selection;
      this.hasSelection = true;
      this.show(editor, view);
    } else {
      // Double-click on empty area — show toolbar at cursor position
      this.currentSelection = '';
      this.hasSelection = false;
      const pos = this.getCursorCoords(editor, view);
      if (pos) {
        this.ui.show(pos, false);
        this.isVisible = true;
      }
    }
  }

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
      this.hasSelection = true;
      this.show(editor, view);
    } else {
      this.hide();
    }
  }

  private show(editor: Editor, view: MarkdownView): void {
    const pos = this.getSelectionCoords(editor, view);
    
    if (pos) {
      this.ui.show(pos, true);
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

  private getCursorCoords(
    editor: Editor,
    view: MarkdownView
  ): { left: number; top: number; right: number; bottom: number; width: number } | null {
    try {
      interface EditorWithCM {
        cm?: {
          coordsAtPos(pos: number, bias?: number): { left: number; right: number; top: number; bottom: number } | null;
        };
      }
      const cmEditor = (editor as unknown as EditorWithCM).cm;
      if (!cmEditor) return null;

      const cursor = editor.getCursor();
      const offset = editor.posToOffset(cursor);
      const coords = cmEditor.coordsAtPos(offset);
      if (!coords) return null;

      const containerRect = view.contentEl.getBoundingClientRect();

      return {
        left: coords.left - containerRect.left,
        top: coords.top - containerRect.top,
        right: coords.right - containerRect.left,
        bottom: coords.bottom - containerRect.top,
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

  getHasSelection(): boolean {
    return this.hasSelection;
  }

  destroy(): void {
    if (this.watchedEditorEl) {
      this.watchedEditorEl.removeEventListener('mouseup', this.handleSelectionChange);
      this.watchedEditorEl.removeEventListener('keyup', this.handleSelectionChange);
      this.watchedEditorEl.removeEventListener('dblclick', this.handleDoubleClick);
      this.watchedEditorEl = null;
    }
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('mousedown', this.handleClickOutside);
    this.ui.destroy();
  }
}
