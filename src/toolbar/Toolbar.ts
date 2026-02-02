// SmartPick Toolbar - Main toolbar controller

import { Editor, EditorPosition, MarkdownView } from 'obsidian';
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

    this.debounceTimer = setTimeout(() => {
      this.checkSelection();
    }, this.plugin.settings.toolbarDelay);
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
      console.log('SmartPick Debug - Toolbar.checkSelection captured:', selection.toString().substring(0, 20) + '...');
      this.currentEditor = editor;
      this.currentSelection = selection.toString();
      this.show(editor, view);
    } else {
      this.hide();
    }
  }

  private show(editor: Editor, view: MarkdownView): void {
    const from = editor.getCursor('from');
    const coords = this.getCoords(editor, from, view);
    
    if (coords) {
      this.ui.show(coords.left, coords.top, this.currentSelection);
      this.isVisible = true;
    }
  }

  hide(): void {
    if (this.isVisible) {
      this.ui.hide();
      this.isVisible = false;
    }
  }

  private getCoords(
    editor: Editor, 
    pos: EditorPosition,
    view: MarkdownView
  ): { left: number; top: number } | null {
    try {
      // Get the CodeMirror editor
      // @ts-ignore - accessing internal CM6 editor
      const cmEditor = (editor as any).cm;
      if (!cmEditor) return null;

      const offset = editor.posToOffset(pos);
      const coords = cmEditor.coordsAtPos(offset);
      
      if (!coords) return null;

      const containerRect = view.contentEl.getBoundingClientRect();
      
      return {
        left: coords.left - containerRect.left + this.plugin.settings.toolbarOffsetLeft,
        top: coords.top - containerRect.top - this.plugin.settings.toolbarOffsetTop,
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
