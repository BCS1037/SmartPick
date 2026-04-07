// SmartPick - Obsidian Plugin Main Entry
// 智能划词工具栏 - 选中文本自动弹出工具栏，支持自定义命令和AI功能

import { Plugin, Notice, Editor } from 'obsidian';
import { SmartPickSettings, DEFAULT_SETTINGS } from './settings';
import { initI18n, setLanguage } from './i18n';
import { Toolbar } from './toolbar/Toolbar';
import { SmartPickSettingTab } from './ui/SettingsTab';
import { CommandManager } from './commands/CommandManager';

export default class SmartPickPlugin extends Plugin {
  settings: SmartPickSettings = DEFAULT_SETTINGS;
  private toolbar: Toolbar | null = null;
  public commandManager: CommandManager | null = null;

  async onload(): Promise<void> {


    // Load settings
    await this.loadSettings();

    // Initialize i18n
    initI18n();
    if (this.settings.language !== 'auto') {
      setLanguage(this.settings.language);
    }

    // Initialize toolbar
    this.toolbar = new Toolbar(this);
    this.toolbar.init();

    // Initialize command manager
    this.commandManager = new CommandManager(this);
    this.commandManager.init();

    // Add settings tab
    this.addSettingTab(new SmartPickSettingTab(this.app, this));

    // Register styles
    this.registerStyles();

    // Register built-in commands
    this.registerBuiltInCommands();
  }

  onunload(): void {

    
    if (this.toolbar) {
      this.toolbar.destroy();
      this.toolbar = null;
    }
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

    // Migration: Remove old translations and Add Built-in Tools
    const templatesToRemove = ['translate-en', 'translate-zh'];
    
    // 1. Remove old templates
    this.settings.promptTemplates = this.settings.promptTemplates.filter(t => !templatesToRemove.includes(t.id));

    // 2. Ensure new translate template exists if it's missing
    if (!this.settings.promptTemplates.find(t => t.id === 'translate')) {
         const defaultTranslate = DEFAULT_SETTINGS.promptTemplates.find(t => t.id === 'translate');
         if (defaultTranslate) {
             this.settings.promptTemplates.push(defaultTranslate);
         }
    }

    // 3. Migrate toolbar items
    this.settings.toolbarItems.forEach(item => {
        if (item.type === 'ai' && item.promptTemplateId && templatesToRemove.includes(item.promptTemplateId)) {
            item.promptTemplateId = 'translate';
        }
    });

    // 4. Add Built-in Tools Group if missing
    if (!this.settings.commandGroups.find(g => g.id === 'builtin')) {
        const builtinGroup = DEFAULT_SETTINGS.commandGroups.find(g => g.id === 'builtin');
        if (builtinGroup) {
            // Insert before 'link' group (order 2)
            this.settings.commandGroups.push(builtinGroup);
            this.settings.commandGroups.sort((a, b) => a.order - b.order);
        }
    }

    // 5. Add Built-in Tool Items if missing
    const builtinItems = DEFAULT_SETTINGS.toolbarItems.filter(i => i.group === 'builtin');
    const existingIds = new Set(this.settings.toolbarItems.map(i => i.id));
    
    let addedItems = false;
    for (const item of builtinItems) {
        if (!existingIds.has(item.id)) {
            this.settings.toolbarItems.push(item);
            addedItems = true;
        }
    }

    // 7. Migration: Merge 'format' group into 'builtin'
    // Move existing format items to builtin
    this.settings.toolbarItems.forEach(item => {
        if (item.group === 'format') {
            item.group = 'builtin';
        }
    });

    // Remove format group if it exists
    this.settings.commandGroups = this.settings.commandGroups.filter(g => g.id !== 'format');

    // Ensure builtin group exists and update order
    let builtinGroup = this.settings.commandGroups.find(g => g.id === 'builtin');
    if (!builtinGroup) {
        builtinGroup = { id: 'builtin', name: '内置工具集', order: 0 };
        this.settings.commandGroups.push(builtinGroup);
    } else {
        builtinGroup.order = 0; // Move to top
    }
    
    // Reorder other groups
    const aiGroup = this.settings.commandGroups.find(g => g.id === 'ai');
    if (aiGroup) aiGroup.order = 1;
    
    const linkGroup = this.settings.commandGroups.find(g => g.id === 'link');
    if (linkGroup) linkGroup.order = 2;
    
    const shortcutGroup = this.settings.commandGroups.find(g => g.id === 'shortcut');
    if (shortcutGroup) shortcutGroup.order = 3;

    this.settings.commandGroups.sort((a, b) => a.order - b.order);

    // 8. Migration: Update Built-in Tools config (v0.4.1 update)
    // Remove italic
    this.settings.toolbarItems = this.settings.toolbarItems.filter(item => item.id !== 'italic');

    // Add new items (quote, footnote, copy-note, copy-note-file) if missing
    const newItems = DEFAULT_SETTINGS.toolbarItems.filter(i => ['quote', 'footnote', 'paste-url-into-selection', 'copy-note', 'copy-note-file'].includes(i.id));
    const currentIds = new Set(this.settings.toolbarItems.map(i => i.id));
    
    for (const item of newItems) {
        if (!currentIds.has(item.id)) {
            // Push a copy to avoid mutating DEFAULT_SETTINGS
            this.settings.toolbarItems.push({ ...item });
        }
    }

    // Update enabled state and icons for existing items to match new defaults
    const defaultsMap = new Map(DEFAULT_SETTINGS.toolbarItems.map(i => [i.id, i]));
    
    this.settings.toolbarItems.forEach(item => {
        const def = defaultsMap.get(item.id);
        if (def) {
            // Update Icon
            if (['link-google', 'link-baidu', 'link-deepseek'].includes(item.id)) {
                item.icon = def.icon;
            }
            
            // Update Enabled State (only for builtin items involved in the change)
            if (['bold', 'superscript', 'subscript', 'quote', 'footnote', 'callout', 'copy', 'paste', 'cut', 'inline-code', 'code-block', 'table', 'clear-formatting', 'highlight', 'paste-url-into-selection',
                 'ai-translate', 'ai-summarize', 'ai-explain', 
                 'link-google', 'link-google-scholar', 'link-baidu', 'link-chatgpt', 'link-gemini', 'link-deepseek', 
                 'shortcut-todo', 'shortcut-find', 'copy-note', 'copy-note-file'].includes(item.id)) {
                 item.enabled = def.enabled;
            }

            // Update tooltip text if it changed
            item.tooltip = def.tooltip;
        }
    });

    // Re-sort builtin items
    const builtinOrderMap = new Map(DEFAULT_SETTINGS.toolbarItems
        .filter(i => i.group === 'builtin')
        .map((i, index) => [i.id, index]));
    
    this.settings.toolbarItems.sort((a, b) => {
        if (a.group === 'builtin' && b.group === 'builtin') {
             const oa = builtinOrderMap.get(a.id) ?? 999;
             const ob = builtinOrderMap.get(b.id) ?? 999;
             return oa - ob;
        }
        return 0; 
    });

    this.settings.toolbarItems.forEach(item => {
        if (item.group === 'builtin') {
             const def = defaultsMap.get(item.id);
             if (def) {
                 item.order = def.order;
             }
        }
    });

    // Final Safety: Remove duplicates based on ID
    // Keep the last occurrence or the first? 
    // Usually first is better if we just appended duplicates. 
    // However, if we appended new defaults, we want to keep user's existing config if it exists?
    // Actually, in the migration steps above, we might have appended duplicates if checks failed.
    // Let's keep the first occurrence of each ID.
    const seenIds = new Set();
    this.settings.toolbarItems = this.settings.toolbarItems.filter(item => {
        if (seenIds.has(item.id)) {
            return false;
        }
        seenIds.add(item.id);
        return true;
    });

    // 6. Save immediately to persist migration
    // Safe check using unknown cast to avoid 'any'
    const unknownData = data as unknown as Record<string, unknown> | null;
    const hasOldTemplates = unknownData?.promptTemplates && Array.isArray(unknownData.promptTemplates) && 
        unknownData.promptTemplates.some((t: { id?: string }) => templatesToRemove.includes(t.id ?? ''));
    const hasOldItems = unknownData?.toolbarItems && Array.isArray(unknownData.toolbarItems) && 
        unknownData.toolbarItems.some((t: { promptTemplateId?: string }) => templatesToRemove.includes(t.promptTemplateId ?? ''));
    
    // Check if we added the built-in group or items (need to save)
    // Also save if we removed duplicates (length changed)
    const originalLength = (data as any)?.toolbarItems?.length || 0;
    if (hasOldTemplates || hasOldItems || addedItems || !this.settings.commandGroups.find(g => g.id === 'builtin') || this.settings.toolbarItems.length !== originalLength || true) {
        await this.saveSettings();
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private registerStyles(): void {
    // Styles are loaded from styles.css automatically by Obsidian
  }

  private registerBuiltInCommands(): void {
    // Superscript
    this.addCommand({
        id: 'superscript',
        name: 'SmartPick: Superscript',
        icon: 'superscript',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                editor.replaceSelection(`<sup>${selection}</sup>`);
            }
        }
    });

    // Subscript
    this.addCommand({
        id: 'subscript',
        name: 'SmartPick: Subscript',
        icon: 'subscript',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                editor.replaceSelection(`<sub>${selection}</sub>`);
            }
        }
    });

    // Insert Code Block
    this.addCommand({
        id: 'insert-code-block',
        name: 'SmartPick: Insert Code Block',
        icon: 'file-code',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            editor.replaceSelection(`\`\`\`\n${selection}\n\`\`\``);
        }
    });

    // Copy
    this.addCommand({
        id: 'copy',
        name: 'SmartPick: Copy',
        icon: 'copy',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                navigator.clipboard.writeText(selection);
                new Notice('Copied to clipboard');
            }
        }
    });

    // Cut
    this.addCommand({
        id: 'cut',
        name: 'SmartPick: Cut',
        icon: 'scissors',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                navigator.clipboard.writeText(selection);
                editor.replaceSelection('');
                new Notice('Cut to clipboard');
            }
        }
    });

    // Paste
    this.addCommand({
        id: 'paste',
        name: 'SmartPick: Paste',
        icon: 'clipboard',
        editorCallback: async (editor) => {
            try {
                const text = await navigator.clipboard.readText();
                editor.replaceSelection(text);
            } catch (err) {
                new Notice('Failed to paste from clipboard');
                console.error(err);
            }
        }
    });

    // Clear Formatting
    this.addCommand({
        id: 'clear-formatting',
        name: 'SmartPick: Clear Formatting',
        icon: 'remove-formatting',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                 // Simple regex approach to remove clear common markdown syntax
                 // This is not perfect but covers Bold, Italic, Strikethrough, Links, Code
                 let plain = selection
                    .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
                    .replace(/(\*|_)(.*?)\1/g, '$2')   // Italic
                    .replace(/~~(.*?)~~/g, '$1')       // Strikethrough
                    .replace(/`([^`]*)`/g, '$1')       // Inline Code
                    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'); // Links
                 
                 editor.replaceSelection(plain);
            }
        }
    });

    // Paste URL into Selection
    this.addCommand({
        id: 'paste-url-into-selection',
        name: 'SmartPick: Paste URL into Selection',
        icon: 'link',
        editorCallback: async (editor) => {
            await this.pasteUrlIntoSelection(editor);
        }
    });

    // Copy Current Note Content
    this.addCommand({
        id: 'copy-note',
        name: 'SmartPick: Copy Current Note Content',
        icon: 'copy',
        callback: async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active file');
                return;
            }
            try {
                const content = await this.app.vault.read(activeFile);
                await navigator.clipboard.writeText(content);
                new Notice('Note content copied to clipboard');
            } catch (err) {
                new Notice('Failed to copy note content');
                console.error(err);
            }
        }
    });

    // Copy Current Note File (as Attachment)
    this.addCommand({
        id: 'copy-note-file',
        name: 'SmartPick: Copy Current Note File',
        icon: 'paperclip',
        callback: async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active file');
                return;
            }
            
            try {
                // Get absolute path
                const adapter = this.app.vault.adapter;
                // A more reliable way to detect desktop is checking if getFullPath exists on the adapter
                const isDesktop = typeof (adapter as any).getFullPath === 'function';
                
                if (isDesktop) {
                    const fullPath = (adapter as any).getFullPath(activeFile.path);
                    
                    // Try to get electron from various possible sources
                    let electron: any = null;
                    if (typeof (window as any).require === 'function') {
                        try {
                            electron = (window as any).require('electron');
                        } catch (e) {
                            console.log('require("electron") failed', e);
                        }
                    }
                    
                    const clipboard = electron?.clipboard || (window as any).electron?.clipboard;
                    
                    const isMacOS = navigator.platform.indexOf('Mac') > -1 || navigator.userAgent.indexOf('Mac') > -1;
                    
                    if (isMacOS) {
                        try {
                            if (clipboard && typeof clipboard.writeBuffer === 'function') {
                                clipboard.clear();
                                const fileUrl = `file://${encodeURI(fullPath)}`;
                                // Access Buffer (available in Obsidian's electron node context)
                                const BufferClass = (window as any).Buffer || require('buffer').Buffer;
                                
                                clipboard.writeBuffer('public.file-url', BufferClass.from(fileUrl, 'utf-8'));
                                new Notice('Note file copied to clipboard');
                                console.log('SmartPick: Successfully wrote file URL to clipboard.');
                            } else {
                                throw new Error('writeBuffer not available');
                            }
                        } catch (e) {
                            console.error('macOS file copy failed', e);
                            if (clipboard) {
                                clipboard.clear();
                                clipboard.write({ filenames: [fullPath], text: fullPath });
                                new Notice('Note file copied (fallback)');
                            } else {
                                new Notice('Copy failed: Electron clipboard not accessible');
                            }
                        }
                    } else {
                        if (clipboard) {
                            // Clear before writing to ensure clean state
                            clipboard.clear();
                            clipboard.write({ filenames: [fullPath], text: fullPath });
                            new Notice(`Note file copied to clipboard`);
                            console.log('SmartPick: Successfully wrote to clipboard.', { path: fullPath });
                        } else {
                            new Notice('Copy failed: Electron clipboard not accessible');
                            console.error('Electron clipboard not found. Available keys on window:', Object.keys(window));
                        }
                    }
                } else {
                    new Notice('File copying is only supported on Obsidian Desktop');
                }
            } catch (err) {
                new Notice(`Error copying file: ${err.message || err}`);
                console.error('SmartPick Copy File Error:', err);
            }
        }
    });
  }

  /**
   * Paste URL into Selection - "Notion style" link pasting
   * If clipboard has a URL and text is selected → [selected text](url)
   * If selection is a URL and clipboard has text → [clipboard text](selection)
   * If clipboard has a URL and nothing is selected → paste [](url) with cursor between brackets
   */
  private async pasteUrlIntoSelection(editor: Editor): Promise<void> {
    let clipboardText: string;
    try {
        clipboardText = (await navigator.clipboard.readText()).trim();
    } catch {
        new Notice('Failed to read clipboard');
        return;
    }

    if (!clipboardText) {
        new Notice('Clipboard is empty');
        return;
    }

    const selectedText = editor.getSelection();
    const cbIsUrl = this.isUrl(clipboardText);
    const selIsUrl = selectedText ? this.isUrl(selectedText.trim()) : false;

    if (cbIsUrl && selectedText) {
        // Clipboard is URL, selection is text → [text](url)
        const url = this.processUrl(clipboardText);
        const imgMark = this.isImageUrl(clipboardText) ? '!' : '';
        editor.replaceSelection(`${imgMark}[${selectedText}](${url})`);
    } else if (selIsUrl && clipboardText && !cbIsUrl) {
        // Selection is URL, clipboard is text → [text](url)
        const url = this.processUrl(selectedText.trim());
        const imgMark = this.isImageUrl(selectedText.trim()) ? '!' : '';
        editor.replaceSelection(`${imgMark}[${clipboardText}](${url})`);
    } else if (cbIsUrl && !selectedText) {
        // Clipboard is URL, nothing selected → insert [](url) and place cursor
        const url = this.processUrl(clipboardText);
        const cursor = editor.getCursor();
        const linkText = `[](${url})`;
        editor.replaceRange(linkText, cursor);
        // Place cursor between square brackets
        editor.setCursor({ line: cursor.line, ch: cursor.ch + 1 });
    } else {
        // Neither is a URL, just do a normal paste
        editor.replaceSelection(clipboardText);
    }
  }

  /** Check if a string is a valid URL */
  private isUrl(text: string): boolean {
    // Match http(s), ftp, file protocols, or protocol-relative URLs
    if (/^(https?:\/\/|ftp:\/\/|file:\/\/\/|\/\/)\S+$/i.test(text)) return true;
    // Match obsidian:// and other app schemes
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/\S+$/i.test(text)) return true;
    // Simple domain pattern: something.tld/...
    if (/^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(text)) return true;
    return false;
  }

  /** Check if the URL points to an image */
  private isImageUrl(url: string): boolean {
    return /\.(png|jpe?g|gif|svg|webp|bmp|ico|avif)(\?.*)?$/i.test(url);
  }

  /** Process URL: encode special characters if needed */
  private processUrl(url: string): string {
    // If URL contains unencoded spaces, encode them
    if (url.includes(' ')) {
        url = url.replace(/ /g, '%20');
    }
    // Strip surrounding angle brackets if present
    if (/^<.*>$/.test(url)) {
        url = url.slice(1, -1);
    }
    return url;
  }
}
