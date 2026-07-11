// SmartPick Toolbar - Main toolbar controller

import { Editor, MarkdownView, Platform } from 'obsidian';
import type { EditorPosition } from 'obsidian';
import type SmartPickPlugin from '../main';
import { ToolbarUI } from './ToolbarUI';

const TOOLBAR_DELAY_MS = 200;
const OUTSIDE_DISMISS_GUARD_MS = TOOLBAR_DELAY_MS + 50;

interface SavedSelectionRange {
  anchor: EditorPosition;
  head: EditorPosition;
}

export class Toolbar {
  private plugin: SmartPickPlugin;
  private ui: ToolbarUI;
  private isVisible: boolean = false;
  private debounceTimer: number | null = null;
  private currentEditor: Editor | null = null;
  private currentSelection: string = '';
  private currentSelectionRange: SavedSelectionRange | null = null;
  private watchedEditorEl: HTMLElement | null = null;
  private hasSelection: boolean = false;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchMoved: boolean = false;
  private ignoreSelectionChangeUntil: number = 0;

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
    activeDocument.addEventListener('keydown', this.handleKeyDown);

    // 在捕获阶段处理编辑器外点击，避免 CodeMirror 停止冒泡后无法关闭工具栏。
    activeDocument.addEventListener('mousedown', this.handleClickOutside, true);

    if (Platform.isMobile) {
      activeDocument.addEventListener('selectionchange', this.handleDocumentSelectionChange);
      activeDocument.addEventListener('touchstart', this.handleTouchOutside, { passive: true });
    }
  }

  private attachEditorListeners(): void {
    // Cleanup previous listeners
    if (this.watchedEditorEl) {
      this.watchedEditorEl.removeEventListener('mouseup', this.handleSelectionChange);
      this.watchedEditorEl.removeEventListener('keyup', this.handleSelectionChange);
      this.watchedEditorEl.removeEventListener('dblclick', this.handleDoubleClick);
      this.watchedEditorEl.removeEventListener('touchstart', this.handleTouchStart);
      this.watchedEditorEl.removeEventListener('touchmove', this.handleTouchMove);
      this.watchedEditorEl.removeEventListener('touchend', this.handleTouchEnd);
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
      if (Platform.isMobile) {
        this.watchedEditorEl.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        this.watchedEditorEl.addEventListener('touchmove', this.handleTouchMove, { passive: true });
        this.watchedEditorEl.addEventListener('touchend', this.handleTouchEnd);
      }
    }
  }

  private handleSelectionChange = (e: MouseEvent | KeyboardEvent): void => {
    if (this.shouldIgnoreSelectionChange()) return;

    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    let modifierActive = false;
    if (this.plugin.settings.enableModifierKeyTrigger) {
      modifierActive = this.checkEventModifier(e);
    }

    this.scheduleSelectionCheck(modifierActive);
  };

  private scheduleSelectionCheck(modifierActive: boolean = false): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.checkSelection(modifierActive);
    }, TOOLBAR_DELAY_MS);
  }

  private handleTouchStart = (e: TouchEvent): void => {
    const touch = e.touches[0];
    if (!touch) return;
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchMoved = false;
  };

  private handleTouchMove = (e: TouchEvent): void => {
    const touch = e.touches[0];
    if (!touch) return;
    const deltaX = Math.abs(touch.clientX - this.touchStartX);
    const deltaY = Math.abs(touch.clientY - this.touchStartY);
    if (deltaX > 8 || deltaY > 8) {
      this.touchMoved = true;
    }
  };

  private handleTouchEnd = (): void => {
    if (this.ui.isMenuLocked()) return;
    if (this.shouldIgnoreSelectionChange()) return;
    if (this.touchMoved) return;
    this.scheduleSelectionCheck(false);
  };

  private handleDocumentSelectionChange = (): void => {
    if (this.ui.isMenuLocked()) return;
    if (this.shouldIgnoreSelectionChange()) return;

    const activeElement = activeDocument.activeElement;
    if (activeElement?.closest('.smartpick-toolbar')) return;

    const selection = activeWindow.getSelection();
    if (!selection || selection.toString().trim().length === 0) return;
    this.scheduleSelectionCheck(false);
  };

  private handleDoubleClick = (e: MouseEvent): void => {
    if (this.shouldIgnoreSelectionChange()) return;

    // Check if double-click trigger is enabled
    if (!this.plugin.settings.enableDoubleClickTrigger) return;

    // Don't trigger if clicking on the toolbar itself
    const target = e.target as HTMLElement;
    if (target.closest('.smartpick-toolbar')) return;

    // Cancel any pending selection check to avoid conflict
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    // Use a short delay to let the browser's native double-click selection complete
    window.setTimeout(() => {
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

  private checkSelection(modifierActive?: boolean): void {
    if (this.ui.isMenuLocked()) return;

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
      
      if (this.plugin.settings.enableModifierKeyTrigger && !Platform.isMobile) {
        if (modifierActive) {
          this.show(editor, view);
        } else {
          this.hide();
        }
      } else {
        this.show(editor, view);
      }
    } else {
      this.hide();
    }
  }

  private show(editor: Editor, view: MarkdownView): void {
    if (this.ui.isMenuLocked()) return;

    this.saveCurrentSelectionRange(editor);

    const pos = this.getSelectionCoords(editor, view);
    if (pos) {
      this.ui.show(pos, true);
      this.isVisible = true;
    } else {
      this.hide();
    }
  }

  hide(): void {
    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

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
      const headCoords = cmEditor.coordsAtPos(headOffset);
      if (!headCoords) return null;

      const containerRect = view.contentEl.getBoundingClientRect();

      // 多行选区跟随用户最后拖动且当前可见的活动端点。
      if (headCoords.bottom <= containerRect.top || headCoords.top >= containerRect.bottom) {
        return null;
      }

      return {
        left: headCoords.left - containerRect.left,
        top: headCoords.top - containerRect.top,
        right: headCoords.right - containerRect.left,
        bottom: headCoords.bottom - containerRect.top,
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

  private checkEventModifier(e: MouseEvent | KeyboardEvent): boolean {
    const config = this.plugin.settings.modifierKey || 'CmdOrCtrl';
    
    if (config === 'CmdOrCtrl') {
      return Platform.isMacOS ? e.metaKey : e.ctrlKey;
    }
    
    if (config === 'Control') {
      return e.ctrlKey;
    }
    
    if (config === 'Meta') {
      return e.metaKey;
    }
    
    if (config === 'Alt') {
      return e.altKey;
    }
    
    if (config === 'Shift') {
      return e.shiftKey;
    }
    
    return false;
  }

  private handleClickOutside = (e: MouseEvent): void => {
    if (!this.isVisible) return;
    
    const target = e.target as HTMLElement;
    if (this.markToolbarInteraction(target)) return;

    this.dismissAfterOutsideInteraction();
  };

  private handleTouchOutside = (e: TouchEvent): void => {
    if (!this.isVisible) return;

    const target = e.target as HTMLElement;
    if (this.markToolbarInteraction(target)) return;

    this.dismissAfterOutsideInteraction();
  };

  private dismissAfterOutsideInteraction(): void {
    // 忽略同一次点击随后触发的 mouseup/touchend，避免隐藏后立刻重开。
    this.ignoreSelectionChangeUntil = activeWindow.performance.now() + OUTSIDE_DISMISS_GUARD_MS;
    this.hide();
  }

  private markToolbarInteraction(target: HTMLElement): boolean {
    if (!target.closest('.smartpick-toolbar')) return false;

    // iOS 点浮动按钮会触发 selectionchange；短暂忽略，避免更多菜单刚打开又被重渲染收起。
    this.ignoreSelectionChangeUntil = activeWindow.performance.now() + 500;
    return true;
  }

  private shouldIgnoreSelectionChange(): boolean {
    return activeWindow.performance.now() < this.ignoreSelectionChangeUntil;
  }

  private saveCurrentSelectionRange(editor: Editor): void {
    const selection = editor.listSelections()[0];
    if (!selection) return;

    this.currentSelectionRange = {
      anchor: { ...selection.anchor },
      head: { ...selection.head },
    };
  }

  restoreCurrentSelection(): void {
    if (!this.currentEditor || !this.currentSelectionRange || !this.currentSelection) return;

    this.ignoreSelectionChangeUntil = activeWindow.performance.now() + 500;
    this.currentEditor.focus();
    this.currentEditor.setSelection(
      this.currentSelectionRange.anchor,
      this.currentSelectionRange.head
    );
  }

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
      this.watchedEditorEl.removeEventListener('touchstart', this.handleTouchStart);
      this.watchedEditorEl.removeEventListener('touchmove', this.handleTouchMove);
      this.watchedEditorEl.removeEventListener('touchend', this.handleTouchEnd);
      this.watchedEditorEl = null;
    }
    activeDocument.removeEventListener('keydown', this.handleKeyDown);
    activeDocument.removeEventListener('mousedown', this.handleClickOutside, true);
    activeDocument.removeEventListener('selectionchange', this.handleDocumentSelectionChange);
    activeDocument.removeEventListener('touchstart', this.handleTouchOutside);
    this.ui.destroy();
  }
}
