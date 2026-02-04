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
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private registerStyles(): void {
    // Styles are loaded from styles.css automatically by Obsidian
  }
}
