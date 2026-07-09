// SmartPick - Obsidian Plugin Main Entry
// 智能划词工具栏 - 选中文本自动弹出工具栏，支持自定义命令和AI功能

import { Plugin, Notice, Editor, FileSystemAdapter, Platform, TFile, normalizePath } from 'obsidian';
import { SmartPickSettings, DEFAULT_SETTINGS, OutputAction } from './settings';
import { initI18n, localize, setLanguage } from './i18n';
import { Toolbar } from './toolbar/Toolbar';
import { SmartPickSettingTab } from './ui/SettingsTab';
import { CommandManager } from './commands/CommandManager';

const CURRENT_MIGRATION_VERSION = 3;
const REMOVED_BUILTIN_TOOLBAR_ITEM_IDS = new Set([
  'bold',
  'quote',
  'copy',
  'paste',
  'cut',
  'shortcut-find',
  'sep1',
]);

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
    interface LegacyPromptTemplate {
      id?: string;
      name: string;
      category?: string;
      prompt: string;
      outputAction?: OutputAction;
      isBuiltin?: boolean;
    }

    type LegacySettings = Partial<SmartPickSettings> & {
      promptTemplates?: LegacyPromptTemplate[];
      commandGroups?: unknown;
    };

    const data = await this.loadData() as LegacySettings | null;
    const migrationVersion = data?.migrationVersion ?? 0;
    const legacyPromptTemplates = Array.isArray(data?.promptTemplates) ? data.promptTemplates : [];
    const defaultToolbarItems = [...DEFAULT_SETTINGS.toolbarItems];
    const defaultToolbarItemMap = new Map(defaultToolbarItems.map((item) => [item.id, item]));
    if (data && migrationVersion < CURRENT_MIGRATION_VERSION) {
      await this.backupSettings('before-migration', data);
    }

    this.settings = {
      ...DEFAULT_SETTINGS,
      ...data,
      aiConfig: {
        ...DEFAULT_SETTINGS.aiConfig,
        ...(data?.aiConfig ?? {}),
      },
    };
    let shouldSaveSettings = false;

    if (!Array.isArray(this.settings.toolbarItems) || this.settings.toolbarItems.length === 0) {
      this.settings.toolbarItems = defaultToolbarItems.map((item) => ({ ...item }));
      shouldSaveSettings = true;
    }

    const existingToolbarItemIds = new Set(this.settings.toolbarItems.map((item) => item.id));
    for (const template of legacyPromptTemplates.filter((template) => !template.isBuiltin)) {
      const id = template.id || `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`;
      const exists = existingToolbarItemIds.has(id)
        || this.settings.toolbarItems.some((item) => item.type === 'ai' && item.tooltip === template.name);
      if (exists) continue;

      this.settings.toolbarItems.push({
        id,
        type: 'ai',
        icon: 'sparkles',
        tooltip: template.name,
        enabled: true,
        prompt: template.prompt,
        outputAction: template.outputAction || 'replace',
        group: 'custom',
        order: this.getNextToolbarOrder(),
        isBuiltin: false,
      });
      existingToolbarItemIds.add(id);
      shouldSaveSettings = true;
    }

    const toolbarLengthBeforeCleanup = this.settings.toolbarItems.length;
    this.settings.toolbarItems = this.settings.toolbarItems.filter((item) => {
        if (item.type === 'separator') return false;
        return !REMOVED_BUILTIN_TOOLBAR_ITEM_IDS.has(item.id);
    });
    if (this.settings.toolbarItems.length !== toolbarLengthBeforeCleanup) {
        shouldSaveSettings = true;
    }

    for (const defaultItem of defaultToolbarItems) {
        if (!existingToolbarItemIds.has(defaultItem.id)) {
            this.settings.toolbarItems.push({ ...defaultItem });
            existingToolbarItemIds.add(defaultItem.id);
            shouldSaveSettings = true;
        }
    }

    if (migrationVersion < CURRENT_MIGRATION_VERSION) {
        for (const item of this.settings.toolbarItems) {
            const defaultItem = defaultToolbarItemMap.get(item.id);
            if (defaultItem) {
                const userEnabled = item.enabled;
                const userOrder = item.order;
                const userPrompt = item.prompt;
                const userOutputAction = item.outputAction;
                const userAiIcon = item.type === 'ai' ? item.icon : undefined;
                item.isBuiltin = true;
                item.type = defaultItem.type;
                item.icon = defaultItem.icon;
                item.tooltip = defaultItem.tooltip;
                item.enabled = typeof userEnabled === 'boolean' ? userEnabled : defaultItem.enabled;
                item.commandId = defaultItem.commandId;
                item.prompt = userPrompt || defaultItem.prompt;
                item.outputAction = userOutputAction || defaultItem.outputAction;
                item.url = defaultItem.url;
                item.shortcutKeys = defaultItem.shortcutKeys;
                item.group = 'builtin';
                item.order = Number.isFinite(userOrder) ? userOrder : defaultItem.order;
                if (defaultItem.type === 'ai' && userAiIcon) {
                    item.icon = userAiIcon;
                }
            } else if (!item.group || ['format', 'ai', 'link', 'shortcut', 'ungrouped'].includes(item.group)) {
                item.group = 'custom';
                item.isBuiltin = false;
            }

            if (item.type === 'ai') {
                const legacyTemplate = legacyPromptTemplates.find((template) => template.id === item.promptTemplateId);
                item.prompt = item.prompt || legacyTemplate?.prompt || defaultItem?.prompt || '';
                item.outputAction = item.outputAction || legacyTemplate?.outputAction || defaultItem?.outputAction || 'replace';
                delete item.promptTemplateId;
            }
        }
        this.settings.migrationVersion = CURRENT_MIGRATION_VERSION;
        shouldSaveSettings = true;
    }

    const seenIds = new Set<string>();
    const lengthBeforeDedup = this.settings.toolbarItems.length;
    this.settings.toolbarItems = this.settings.toolbarItems.filter(item => {
        if (seenIds.has(item.id)) {
            return false;
        }
        seenIds.add(item.id);
        return true;
    });
    if (this.settings.toolbarItems.length !== lengthBeforeDedup) {
        shouldSaveSettings = true;
    }

    this.settings.toolbarItems.sort((a, b) => a.order - b.order);

    if (shouldSaveSettings) {
        const migratedSettings = this.settings as SmartPickSettings & LegacySettings;
        delete migratedSettings.promptTemplates;
        delete migratedSettings.commandGroups;
        await this.saveSettings();
    }
  }

  private getNextToolbarOrder(): number {
    return Math.max(-1, ...this.settings.toolbarItems.map((item) => item.order)) + 1;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async backupSettings(reason: string, sourceData: unknown = this.settings): Promise<void> {
    const pluginDir = this.manifest.dir || `.obsidian/plugins/${this.manifest.id}`;
    const backupDir = normalizePath(`${pluginDir}/settings-backups`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeReason = reason.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const backupPath = normalizePath(`${backupDir}/smartpick-settings-${timestamp}-${safeReason}.json`);

    try {
      if (!await this.app.vault.adapter.exists(backupDir)) {
        await this.app.vault.adapter.mkdir(backupDir);
      }

      await this.app.vault.adapter.write(backupPath, JSON.stringify({
        schemaVersion: 1,
        pluginId: this.manifest.id,
        pluginVersion: this.manifest.version,
        reason,
        backedUpAt: new Date().toISOString(),
        settings: sourceData,
      }, null, 2));
    } catch (err) {
      console.error('SmartPick settings backup failed:', err);
    }
  }

  private registerStyles(): void {
    // Styles are loaded from styles.css automatically by Obsidian
  }

  private registerBuiltInCommands(): void {
    // Superscript
    this.addCommand({
        id: 'superscript',
        name: 'Superscript',
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
        name: 'Subscript',
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
        name: 'Insert Code Block',
        icon: 'file-code',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            editor.replaceSelection(`\`\`\`\n${selection}\n\`\`\``);
        }
    });

    // Copy
    this.addCommand({
        id: 'copy',
        name: 'Copy',
        icon: 'copy',
        editorCallback: async (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                await navigator.clipboard.writeText(selection);
                new Notice('Copied to clipboard');
            }
        }
    });

    // Cut
    this.addCommand({
        id: 'cut',
        name: 'Cut',
        icon: 'scissors',
        editorCallback: async (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                await navigator.clipboard.writeText(selection);
                editor.replaceSelection('');
                new Notice('Cut to clipboard');
            }
        }
    });

    // Paste
    this.addCommand({
        id: 'paste',
        name: 'Paste',
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
        name: 'Clear Formatting',
        icon: 'remove-formatting',
        editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (selection) {
                 // Simple regex approach to remove clear common markdown syntax
                 // This is not perfect but covers Bold, Italic, Strikethrough, Links, Code
                 const plain = selection
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
        name: 'Paste URL into Selection',
        icon: 'link',
        editorCallback: async (editor) => {
            await this.pasteUrlIntoSelection(editor);
        }
    });

    // Copy Current Note Content
    this.addCommand({
        id: 'copy-note',
        name: 'Copy Current Note Content',
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
        name: 'Copy Current Note File',
        icon: 'paperclip',
        callback: async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active file');
                return;
            }

            if (Platform.isMobileApp) {
                await this.shareCurrentNoteFileOnMobile(activeFile);
                return;
            }
            
            try {
                // Get absolute path
                const adapter = this.app.vault.adapter;
                
                if (adapter instanceof FileSystemAdapter) {
                    const fullPath = adapter.getFullPath(activeFile.path);
                    
                    const req = (window as unknown as { require?: (mod: string) => unknown }).require;
                    if (!req) {
                        new Notice('Copy failed: require is not available');
                        return;
                    }
                    
                    interface ElectronClipboard {
                        writeBuffer(format: string, buffer: Uint8Array): void;
                        clear(): void;
                        write(data: { filenames?: string[], text?: string }): void;
                    }
                    
                    const electron = req('electron') as { clipboard?: ElectronClipboard };
                    const clipboard = electron?.clipboard;
                    
                    if (Platform.isMacOS) {
                        try {
                            if (clipboard && typeof clipboard.writeBuffer === 'function') {
                                clipboard.clear();
                                const fileUrl = `file://${encodeURI(fullPath)}`;
                                const bufferMod = req('buffer') as { Buffer: { from: (str: string, enc: string) => Uint8Array } };
                                
                                clipboard.writeBuffer('public.file-url', bufferMod.Buffer.from(fileUrl, 'utf-8'));
                                new Notice('Note file copied to clipboard');
                            } else {
                                throw new Error('writeBuffer not available');
                            }
                        } catch {
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
                            clipboard.clear();
                            clipboard.write({ filenames: [fullPath], text: fullPath });
                            new Notice(`Note file copied to clipboard`);
                        } else {
                            new Notice('Copy failed: Electron clipboard not accessible');
                        }
                    }
                } else {
                    new Notice('File copying is only supported on Obsidian Desktop');
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                new Notice(`Error copying file: ${msg}`);
                console.error('SmartPick Copy File Error:', err);
            }
        }
    });
  }

  private async shareCurrentNoteFileOnMobile(activeFile: TFile): Promise<void> {
    try {
      const content = await this.app.vault.read(activeFile);
      const file = new File([content], activeFile.name, { type: 'text/markdown' });
      const shareData: ShareData = {
        files: [file],
        title: activeFile.name,
        text: activeFile.path,
      };

      // 移动端没有 Electron 文件剪贴板，改用系统分享面板传递 Markdown 文件。
      if (navigator.canShare?.(shareData) && navigator.share) {
        await navigator.share(shareData);
        new Notice(localize('已打开系统分享面板', 'System share sheet opened'));
        return;
      }

      await navigator.clipboard.writeText(content);
      new Notice(localize(
        '当前设备不支持文件分享，已复制笔记内容',
        'File sharing is not supported; note content copied'
      ));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new Notice(`${localize('分享笔记文件失败', 'Failed to share note file')}: ${msg}`);
      console.error('SmartPick Mobile Share Error:', err);
    }
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
