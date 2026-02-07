// SmartPick - Obsidian Plugin Main Entry
// 智能划词工具栏 - 选中文本自动弹出工具栏，支持自定义命令和AI功能

import { Plugin } from 'obsidian';
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

    // Migration: Remove old translation templates and items
    const templatesToRemove = ['translate-en', 'translate-zh'];
    
    // 1. Remove old templates
    this.settings.promptTemplates = this.settings.promptTemplates.filter(t => !templatesToRemove.includes(t.id));

    // 2. Ensure new translate template exists if it's missing (it should be in DEFAULT_SETTINGS but might be overwritten by data)
    // Actually, Object.assign might not merge arrays deep enough if they exist in data.
    // If user has customized templates, 'data.promptTemplates' will overwrite 'DEFAULT_SETTINGS.promptTemplates'.
    // So we need to ensure 'translate' is there if we just removed the old ones, BUT only if it doesn't already exist.
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

    // 4. Save immediately to persist migration
    // Safe check using unknown cast to avoid 'any'
    const unknownData = data as unknown as Record<string, unknown> | null;
    const hasOldTemplates = unknownData?.promptTemplates && Array.isArray(unknownData.promptTemplates) && 
        unknownData.promptTemplates.some((t: { id?: string }) => templatesToRemove.includes(t.id ?? ''));
    const hasOldItems = unknownData?.toolbarItems && Array.isArray(unknownData.toolbarItems) && 
        unknownData.toolbarItems.some((t: { promptTemplateId?: string }) => templatesToRemove.includes(t.promptTemplateId ?? ''));

    if (hasOldTemplates || hasOldItems) {
        await this.saveSettings();
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private registerStyles(): void {
    // Styles are loaded from styles.css automatically by Obsidian
  }
}
