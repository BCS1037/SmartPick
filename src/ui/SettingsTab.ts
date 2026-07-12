// SmartPick Settings Tab - Plugin settings UI

import { App, PluginSettingTab, Setting, setIcon, setTooltip, Notice, ButtonComponent, Platform, Modal } from 'obsidian';
import type SmartPickPlugin from '../main';
import { 
  ToolbarItem, 
  generateId,
  AIProvider,
  SmartPickSettings,
  DEFAULT_SETTINGS
} from '../settings';
import { t, getBuiltinToolbarItemLabel, localize } from '../i18n';
import { OpenAIProvider } from '../ai/providers/OpenAIProvider';
import { AnthropicProvider } from '../ai/providers/AnthropicProvider';
import { OllamaProvider } from '../ai/providers/OllamaProvider';
import { CommandModal, AICommandModal, UrlCommandModal, ShortcutModal, AddCommandChoiceModal } from './Modals';

type TabId = 'toolbar' | 'ai';

interface SmartPickSettingsExport {
  schemaVersion: number;
  pluginId: string;
  pluginVersion: string;
  exportedAt: string;
  includesApiKey: boolean;
  settings: SmartPickSettings;
}

interface ParsedSettingsImport {
  settings: SmartPickSettings;
  includesApiKey: boolean | null;
}

export class SmartPickSettingTab extends PluginSettingTab {
  plugin: SmartPickPlugin;
  activeTab: TabId = 'toolbar';
  private settingsRootEl: HTMLElement | null = null;
  private settingsHostEl: HTMLElement | null = null;
  private exportIncludesApiKey = false;

  constructor(app: App, plugin: SmartPickPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // Obsidian < 1.13.0: called directly by the framework
  display(): void {
    // Left empty since we use getSettingDefinitions() in 1.13.0+
  }

  // Obsidian 1.13.0+: declarative entry point — bypasses display()
  getSettingDefinitions() {
    return [
      {
        name: '',
        render: (_setting: Setting) => {
          // Use the Setting row's own element as full-canvas container
          const el = _setting.settingEl;
          if (!el) return;

          // Remove default Setting row layout (name/desc/control columns)
          el.empty();
          el.classList.add('smartpick-declarative-root');
          this.settingsRootEl = el;
          this.markSettingsHost(el);

          this.renderFullSettings(el);
        }
      }
    ];
  }

  // Version-adaptive refresh: update() on 1.13+
  refresh(): void {
    if (this.settingsRootEl?.isConnected) {
      this.settingsRootEl.empty();
      this.settingsRootEl.classList.add('smartpick-declarative-root');
      this.renderFullSettings(this.settingsRootEl);
      return;
    }

    ((this as unknown) as PluginSettingTab & { update: () => void }).update();
  }

  hide(): void {
    this.settingsHostEl?.removeClass('smartpick-settings-host');
    this.settingsHostEl = null;
    this.settingsRootEl = null;
    super.hide();
  }

  private markSettingsHost(rootEl: HTMLElement): void {
    const hostEl = rootEl.closest<HTMLElement>('.vertical-tab-content');
    if (this.settingsHostEl === hostEl) return;

    this.settingsHostEl?.removeClass('smartpick-settings-host');
    hostEl?.addClass('smartpick-settings-host');
    this.settingsHostEl = hostEl;
  }

  // Shared rendering core — works with any HTMLElement container
  private renderFullSettings(containerEl: HTMLElement): void {
    containerEl.addClass('smartpick-settings');
    const contentEl = containerEl.createDiv('smartpick-settings-content');

    // Render Tabs
    const tabsContainer = contentEl.createDiv('smartpick-settings-tabs');
    this.renderCustomTab(tabsContainer, 'toolbar', t('toolbarSettings'));
    this.renderCustomTab(tabsContainer, 'ai', t('aiSettings'));

    // Render Content based on active tab
    const contentContainer = contentEl.createDiv('smartpick-settings-tab-content');
    
    switch (this.activeTab) {
      case 'toolbar':
        this.renderToolbarSettings(contentContainer);
        break;
      case 'ai':
        this.renderAISettings(contentContainer);
        break;
    }
  }

  private renderCustomTab(container: HTMLElement, id: TabId, label: string): void {
    const tab = container.createEl('button', {
      cls: 'smartpick-settings-tab',
      text: label,
    });
    tab.type = 'button';
    if (this.activeTab === id) {
      tab.addClass('active');
    }
    tab.addEventListener('click', () => {
      this.activeTab = id;
      this.refresh();
    });
  }

  private renderToolbarSettings(containerEl: HTMLElement): void {
    // Toolbar Vertical Offset
    new Setting(containerEl)
      .setName(t('toolbarVerticalOffset'))
      .setDesc(t('toolbarVerticalOffsetDesc'))
      .addSlider(slider => slider
        .setLimits(0, 100, 1)
        .setValue(this.plugin.settings.toolbarVerticalOffset)
        .onChange((value) => {
          void (async () => {
             this.plugin.settings.toolbarVerticalOffset = value;
             await this.plugin.saveSettings();
          })();
        })
      );

    // Double-click trigger toggle
    new Setting(containerEl)
      .setName(t('enableDoubleClickTrigger'))
      .setDesc(t('enableDoubleClickTriggerDesc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableDoubleClickTrigger)
        .onChange((value) => {
          void (async () => {
            this.plugin.settings.enableDoubleClickTrigger = value;
            await this.plugin.saveSettings();
          })();
        })
      );

    // Modifier key trigger toggle
    new Setting(containerEl)
      .setName(t('enableModifierKeyTrigger'))
      .setDesc(t('enableModifierKeyTriggerDesc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableModifierKeyTrigger)
        .onChange((value) => {
          void (async () => {
            this.plugin.settings.enableModifierKeyTrigger = value;
            await this.plugin.saveSettings();
            // Refresh settings UI dynamically to show/hide the modifier key dropdown
            this.refresh();
          })();
        })
      );

    // Modifier key dropdown selection
    if (this.plugin.settings.enableModifierKeyTrigger) {
      new Setting(containerEl)
        .setName(t('modifierKeySetting'))
        .setDesc(t('modifierKeySettingDesc'))
        .addDropdown(dropdown => {
          dropdown
            .addOption('CmdOrCtrl', 'Cmd / Ctrl')
            .addOption('Control', 'Ctrl')
            .addOption('Meta', 'Cmd (Mac)')
            .addOption('Alt', 'Alt / Option')
            .addOption('Shift', 'Shift')
            .setValue(this.plugin.settings.modifierKey || 'CmdOrCtrl')
            .onChange((value) => {
              void (async () => {
                this.plugin.settings.modifierKey = value as 'CmdOrCtrl' | 'Control' | 'Meta' | 'Alt' | 'Shift';
                await this.plugin.saveSettings();
              })();
            });
        });
    }

    const customCard = containerEl.createDiv('smartpick-card');
    new Setting(customCard)
      .setName(localize('自定义命令', 'Custom commands'))
      .setHeading()
      .settingEl.classList.add('smartpick-card-title');

    const buttonsContainer = customCard.createDiv('smartpick-settings-buttons');

    new ButtonComponent(buttonsContainer)
      .setButtonText(t('addCommand'))
      .setCta()
      .onClick(() => {
        new AddCommandChoiceModal(this.plugin.app, (choice) => {
          if (choice === 'command') {
            this.showAddCommandModal();
          } else if (choice === 'ai') {
            this.showAddAICommandModal();
          } else if (choice === 'url') {
            this.showAddUrlCommandModal();
          } else if (choice === 'shortcut') {
            this.showAddShortcutModal();
          }
        }).open();
      });

    const customItemsContainer = customCard.createDiv({
      cls: 'smartpick-command-grid smartpick-custom-grid',
    });
    const customItems = this.plugin.settings.toolbarItems
      .filter((item) => !item.isBuiltin && item.type !== 'separator')
      .sort((a, b) => a.order - b.order);
    this.renderCommandGrid(customItemsContainer, customItems, false);

    const builtinCard = containerEl.createDiv('smartpick-card');
    new Setting(builtinCard)
      .setName(localize('内置命令', 'Built-in commands'))
      .setHeading()
      .settingEl.classList.add('smartpick-card-title');
    const builtinDesc = builtinCard.createEl('p', { cls: 'smartpick-command-desc' });
    builtinDesc.setText(localize(
      '插件预设命令可启用、禁用和拖拽排序；前 8 个启用命令显示在工具栏，其余进入“更多”。',
      'Preset commands can be enabled, disabled, and reordered. AI commands can be clicked to edit prompts.'
    ));

    const builtinItemsContainer = builtinCard.createDiv({
      cls: 'smartpick-command-grid smartpick-builtin-grid',
    });
    const builtinItems = this.plugin.settings.toolbarItems
      .filter((item) => item.isBuiltin && item.type !== 'separator')
      .sort((a, b) => a.order - b.order);
    this.renderCommandGrid(builtinItemsContainer, builtinItems, true);
  }

  private renderCommandGrid(
    container: HTMLElement,
    items: ToolbarItem[],
    isBuiltinList: boolean
  ): void {
    container.toggleClass('is-empty', items.length === 0);
    container.toggleClass('smartpick-command-grid-mobile', Platform.isMobile);

    if (!Platform.isMobile) {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
        container.addClass('smartpick-drag-over');
      });

      container.addEventListener('dragleave', () => {
        container.removeClass('smartpick-drag-over');
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.removeClass('smartpick-drag-over');
        const draggedId = e.dataTransfer?.getData('text/plain');
        if (!draggedId) return;

        const draggedItem = this.plugin.settings.toolbarItems.find((item) => item.id === draggedId);
        if (!draggedItem) return;

        const isDraggedBuiltin = !!draggedItem.isBuiltin;
        if (isDraggedBuiltin !== isBuiltinList) {
          new Notice(localize('无法在内置与自定义命令之间拖拽', 'Cannot drag between built-in and custom commands'));
          return;
        }

        if (e.target === container) {
          void (async () => {
            this.moveToolbarItem(draggedId, isBuiltinList, 'end');
            await this.plugin.saveSettings();
            this.refresh();
          })();
        }
      });
    }

    for (const [index, item] of items.entries()) {
      const tile = container.createDiv('smartpick-command-tile');
      if (!Platform.isMobile) {
        tile.setAttribute('draggable', 'true');
      }
      tile.addClass(isBuiltinList ? 'is-builtin' : 'is-custom');
      tile.toggleClass('is-mobile', Platform.isMobile);
      if (item.enabled === false) {
        tile.addClass('is-disabled');
      }

      tile.addEventListener('click', () => {
        this.showEditToolbarItemModal(item);
      });

      if (!Platform.isMobile) {
        tile.addEventListener('dragstart', (e) => {
          e.dataTransfer?.setData('text/plain', item.id);
          tile.addClass('smartpick-sortable-drag');
        });

        tile.addEventListener('dragend', () => {
          tile.removeClass('smartpick-sortable-drag');
          activeDocument.querySelectorAll('.smartpick-drag-over').forEach(el => el.removeClass('smartpick-drag-over'));
        });

        tile.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          tile.addClass('smartpick-drag-over-item');
        });

        tile.addEventListener('dragleave', () => {
          tile.removeClass('smartpick-drag-over-item');
        });

        tile.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          tile.removeClass('smartpick-drag-over-item');

          const draggedId = e.dataTransfer?.getData('text/plain');
          if (!draggedId || draggedId === item.id) return;

          const draggedItem = this.plugin.settings.toolbarItems.find((candidate) => candidate.id === draggedId);
          if (!draggedItem) return;

          const isDraggedBuiltin = !!draggedItem.isBuiltin;
          if (isDraggedBuiltin !== isBuiltinList) {
            new Notice(localize('无法在内置与自定义命令之间拖拽', 'Cannot drag between built-in and custom commands'));
            return;
          }

          void (async () => {
            this.moveToolbarItem(draggedId, isBuiltinList, item.id, e);
            await this.plugin.saveSettings();
            this.refresh();
          })();
        });
      }

      const iconEl = tile.createDiv('smartpick-command-tile-icon');
      if (item.icon) {
        setIcon(iconEl, item.icon);
      }

      if (item.type === 'ai') {
        tile.createSpan({ text: 'AI', cls: 'smartpick-command-tile-badge' });
      }

      const tooltip = item.isBuiltin
        ? getBuiltinToolbarItemLabel(item.id, item.tooltip)
        : item.tooltip;
      tile.setAttribute('aria-label', tooltip);
      tile.setAttribute('data-tooltip', tooltip);
      tile.setAttribute('title', tooltip);
      setTooltip(tile, tooltip, { placement: 'top', delay: 80 });

      const actionsEl = tile.createDiv('smartpick-command-tile-actions');
      if (Platform.isMobile) {
        const moveUpBtn = actionsEl.createEl('button', {
          cls: 'smartpick-command-tile-action',
          attr: {
            'aria-label': localize('上移', 'Move up'),
          },
        });
        moveUpBtn.disabled = index === 0;
        setIcon(moveUpBtn, 'chevron-up');
        setTooltip(moveUpBtn, localize('上移', 'Move up'), { placement: 'top', delay: 80 });
        moveUpBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          void (async () => {
            this.moveToolbarItemByOffset(item.id, isBuiltinList, -1);
            await this.plugin.saveSettings();
            this.refresh();
          })();
        });

        const moveDownBtn = actionsEl.createEl('button', {
          cls: 'smartpick-command-tile-action',
          attr: {
            'aria-label': localize('下移', 'Move down'),
          },
        });
        moveDownBtn.disabled = index === items.length - 1;
        setIcon(moveDownBtn, 'chevron-down');
        setTooltip(moveDownBtn, localize('下移', 'Move down'), { placement: 'top', delay: 80 });
        moveDownBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          void (async () => {
            this.moveToolbarItemByOffset(item.id, isBuiltinList, 1);
            await this.plugin.saveSettings();
            this.refresh();
          })();
        });
      }
      const toggleBtn = actionsEl.createEl('button', {
        cls: 'smartpick-command-tile-action',
        attr: {
          'aria-label': item.enabled !== false ? t('disableCommand') : t('enableCommand'),
        },
      });
      setIcon(toggleBtn, item.enabled !== false ? 'eye' : 'eye-off');
      setTooltip(toggleBtn, item.enabled !== false ? t('disableCommand') : t('enableCommand'), { placement: 'top', delay: 80 });
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        void (async () => {
          item.enabled = item.enabled === false ? true : false;
          await this.plugin.saveSettings();
          this.refresh();
        })();
      });

      if (!isBuiltinList) {
        const editBtn = actionsEl.createEl('button', {
          cls: 'smartpick-command-tile-action',
          attr: {
            'aria-label': t('editCommand'),
          },
        });
        setIcon(editBtn, 'pencil');
        setTooltip(editBtn, t('editCommand'), { placement: 'top', delay: 80 });
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showEditToolbarItemModal(item);
        });

        const deleteBtn = actionsEl.createEl('button', {
          cls: 'smartpick-command-tile-action smartpick-command-tile-delete',
          attr: {
            'aria-label': t('delete'),
          },
        });
        setIcon(deleteBtn, 'trash-2');
        setTooltip(deleteBtn, t('delete'), { placement: 'top', delay: 80 });
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          void this.removeToolbarItem(item.id);
        });
      }
    }
  }

  private moveToolbarItem(
    draggedId: string,
    isBuiltinList: boolean,
    targetId: string,
    event?: DragEvent
  ): void {
    const items = [...this.plugin.settings.toolbarItems]
      .filter((item) => item.type !== 'separator')
      .sort((a, b) => a.order - b.order);
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    if (draggedIndex < 0) return;

    const [draggedItem] = items.splice(draggedIndex, 1);
    const targetIsBuiltin = !!draggedItem.isBuiltin;
    if (targetIsBuiltin !== isBuiltinList) return;

    if (targetId === 'end') {
      let lastSameGroupIndex = -1;
      for (let index = items.length - 1; index >= 0; index--) {
        if (!!items[index].isBuiltin === isBuiltinList) {
          lastSameGroupIndex = index;
          break;
        }
      }
      items.splice(lastSameGroupIndex + 1, 0, draggedItem);
    } else {
      const targetIndex = items.findIndex((item) => item.id === targetId);
      if (targetIndex < 0) return;

      const targetEl = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
      const rect = targetEl?.getBoundingClientRect();
      const insertAfter = rect && event ? event.clientX > rect.left + rect.width / 2 : false;
      items.splice(insertAfter ? targetIndex + 1 : targetIndex, 0, draggedItem);
    }

    items.forEach((item, index) => {
      item.order = index;
    });
  }

  private moveToolbarItemByOffset(itemId: string, isBuiltinList: boolean, offset: -1 | 1): void {
    const items = [...this.plugin.settings.toolbarItems]
      .filter((item) => item.type !== 'separator')
      .sort((a, b) => a.order - b.order);
    const groupItems = items.filter((item) => !!item.isBuiltin === isBuiltinList);
    const groupIndex = groupItems.findIndex((item) => item.id === itemId);
    const targetIndex = groupIndex + offset;
    if (groupIndex < 0 || targetIndex < 0 || targetIndex >= groupItems.length) return;

    const [movedItem] = groupItems.splice(groupIndex, 1);
    groupItems.splice(targetIndex, 0, movedItem);

    let nextGroupIndex = 0;
    const reorderedItems = items.map((item) => {
      if (!!item.isBuiltin !== isBuiltinList) return item;
      return groupItems[nextGroupIndex++];
    });

    reorderedItems.forEach((item, index) => {
      item.order = index;
    });
  }

  private showEditToolbarItemModal(item: ToolbarItem): void {
    const onDelete = () => {
         void (async () => {
             await this.removeToolbarItem(item.id);
         })();
    };

    if (item.isBuiltin && item.type !== 'ai') {
      new Notice(t('notice_builtinCommandReadonly'));
      return;
    }

    if (item.type === 'command') {
      new CommandModal(
        this.plugin.app,
        { id: item.commandId || '', tooltip: item.tooltip, icon: item.icon },
        (id, tooltip, icon) => {
          void (async () => {
              item.commandId = id;
              item.tooltip = tooltip;
              item.icon = icon;
              await this.plugin.saveSettings();
              this.refresh();
          })();
        },
        onDelete
      ).open();
    } else if (item.type === 'ai') {
      new AICommandModal(
        this.plugin.app,
        {
          name: item.tooltip,
          prompt: item.prompt || '',
          icon: item.icon,
          outputAction: item.outputAction || 'replace',
          isBuiltin: item.isBuiltin,
        },
        (name, prompt, icon, outputAction) => {
            void (async () => {
                item.tooltip = name;
                item.prompt = prompt;
                item.icon = icon;
                item.outputAction = outputAction;
                await this.plugin.saveSettings();
                this.refresh();
            })();
        },
        item.isBuiltin ? undefined : onDelete
      ).open();
    } else if (item.type === 'url') {
      new UrlCommandModal(
        this.plugin.app,
        { name: item.tooltip, url: item.url || '', icon: item.icon },
        (name, url, icon) => {
          void (async () => {
              item.tooltip = name;
              item.url = url;
              item.icon = icon;
              await this.plugin.saveSettings();
              this.refresh();
          })();
        },
        onDelete
      ).open();
    } else if (item.type === 'shortcut') {
      new ShortcutModal(
        this.plugin.app,
        { name: item.tooltip, keys: item.shortcutKeys || '', icon: item.icon },
        (name, keys, icon) => {
          void (async () => {
              item.tooltip = name;
              item.shortcutKeys = keys;
              item.icon = icon;
              await this.plugin.saveSettings();
              this.refresh();
          })();
        },
        onDelete
      ).open();
    }
  }

  private renderAISettings(containerEl: HTMLElement): void {
    // containerEl.createEl('h2', { text: t('aiSettings') }); // Removed redundant header

    const { aiConfig } = this.plugin.settings;

    // Provider
    // Provider
    // Provider
    new Setting(containerEl)
      .setName(t('apiProvider'))
      .setDesc(t('apiProviderDesc'))
      .addDropdown(dropdown => {
        dropdown
          .addOption('openai', 'OpenAI')
          .addOption('anthropic', 'Anthropic')
          .addOption('ollama', 'Ollama')
          .addOption('custom', 'Custom (OpenAI compatible)')
          .setValue(aiConfig.provider)
          .onChange((value) => {
            void (async () => {
                aiConfig.provider = value as AIProvider;
                // Update default URL based on provider
                switch (value) {
                  case 'openai':
                    aiConfig.apiUrl = 'https://api.openai.com/v1';
                    break;
                  case 'anthropic':
                    aiConfig.apiUrl = 'https://api.anthropic.com/v1';
                    break;
                  case 'ollama':
                    aiConfig.apiUrl = 'http://localhost:11434';
                    break;
                }
                await this.plugin.saveSettings();
                this.refresh();
            })();
          });
      });

    // API URL
    new Setting(containerEl)
      .setName(t('apiUrl'))
      .setDesc(t('apiUrlDesc'))
      .addText(text => {
        text
          .setPlaceholder('https://api.openai.com/v1')
          .setValue(aiConfig.apiUrl)
          .onChange((value) => {
             void (async () => {
                aiConfig.apiUrl = value;
                await this.plugin.saveSettings();
             })();
          });
      });

    // API Key (not for Ollama)
    if (aiConfig.provider !== 'ollama') {
      new Setting(containerEl)
        .setName(t('apiKey'))
        .setDesc(t('apiKeyDesc'))
        .addText(text => {
          text
            .setPlaceholder('`sk-...`')
            .setValue(aiConfig.apiKey)
            .inputEl.type = 'password';
          text.onChange((value) => {
             void (async () => {
                aiConfig.apiKey = value;
                await this.plugin.saveSettings();
             })();
          });
        });
    }

    // Fetch Models button
    new Setting(containerEl)
      .setName(t('fetchModels'))
      .setDesc(t('fetchModelsDesc'))
      .addButton(button => {
        button.setButtonText(t('fetchModels'));
        button.setButtonText(t('fetchModels'));
        button.onClick(() => {
          void (async () => {
              button.setButtonText(t('fetchingModels'));
              button.setDisabled(true);
              
              try {
                const provider = this.getProvider();
                const models = await provider.fetchModels(aiConfig);
                aiConfig.availableModels = models;
                await this.plugin.saveSettings();
                new Notice(t('success') + `: ${models.length} models`);
                this.refresh();
              } catch (error) {
                new Notice(t('connectionFailed'));
                console.error('Failed to fetch models:', error);
              } finally {
                button.setButtonText(t('fetchModels'));
                button.setDisabled(false);
              }
          })();
        });
      });

    // Model selection
    const modelsSetting = new Setting(containerEl)
      .setName(t('selectModel'))
      .setDesc(t('selectModelDesc'));

    modelsSetting.addText(text => {
      text
        .setPlaceholder('`gpt-4o-mini`')
        .setValue(aiConfig.defaultModel)
        .onChange((value) => {
           void (async () => {
              aiConfig.defaultModel = value;
              await this.plugin.saveSettings();
           })();
        });

      if (aiConfig.availableModels.length > 0) {
        const listId = 'smartpick-models-list';
        text.inputEl.setAttribute('list', listId);
        
        let dataList = activeDocument.getElementById(listId) as HTMLDataListElement;
        if (!dataList) {
          dataList = activeDocument.body.createEl('datalist');
          dataList.id = listId;
        }
        
        dataList.empty();
        for (const model of aiConfig.availableModels) {
          const option = dataList.createEl('option');
          option.value = model;
        }
      }
    });

    // Parameters
    new Setting(containerEl)
        .setName('Parameters')
        .setHeading();
    

    new Setting(containerEl)
      .setName(t('temperature'))
      .setDesc(t('temperatureDesc'))
      .addSlider(slider => slider
        .setLimits(0, 1, 0.1)
        .setValue(aiConfig.temperature)
        .onChange((value) => {
          void (async () => {
              aiConfig.temperature = value;
              await this.plugin.saveSettings();
          })();
        })
      );


    new Setting(containerEl)
      .setName(t('maxTokens'))
      .setDesc(t('maxTokensDesc'))
      .addText(text => text
        .setValue(String(aiConfig.maxTokens))
        .onChange((value) => {
           void (async () => {
              const num = parseInt(value);
              if (!isNaN(num)) {
                aiConfig.maxTokens = num;
                await this.plugin.saveSettings();
              }
           })();
        })
      );

    this.renderSettingsBackupSection(containerEl);
  }

  private renderSettingsBackupSection(containerEl: HTMLElement): void {
    const backupCard = containerEl.createDiv('smartpick-card');
    new Setting(backupCard)
      .setName(localize('配置备份', 'Settings backup'))
      .setHeading()
      .settingEl.classList.add('smartpick-card-title');

    const desc = backupCard.createEl('p', { cls: 'smartpick-command-desc' });
    desc.setText(localize(
      '导出当前工具栏、AI 命令和 AI 服务配置。默认不导出 API 密钥，导入前会自动备份当前配置。',
      'Export toolbar, AI commands, and AI provider settings. API keys are excluded by default. Current settings are backed up before import.'
    ));

    new Setting(backupCard)
      .setName(localize('导出 API 密钥', 'Include API keys'))
      .setDesc(localize(
        '开启后导出的 JSON 会包含密钥，请只保存在可信位置。',
        'When enabled, exported JSON includes secrets. Store it only in trusted locations.'
      ))
      .addToggle(toggle => toggle
        .setValue(this.exportIncludesApiKey)
        .onChange((value) => {
          this.exportIncludesApiKey = value;
        })
      );

    const buttonsContainer = backupCard.createDiv('smartpick-settings-buttons');

    new ButtonComponent(buttonsContainer)
      .setButtonText(localize('导出配置', 'Export settings'))
      .setCta()
      .onClick(() => {
        this.exportSettingsToFile();
      });

    new ButtonComponent(buttonsContainer)
      .setButtonText(localize('导入配置', 'Import settings'))
      .onClick(() => {
        this.chooseSettingsImportFile();
      });
  }

  private exportSettingsToFile(): void {
    const exportedSettings = this.cloneSettings(this.plugin.settings);
    if (!this.exportIncludesApiKey) {
      exportedSettings.aiConfig.apiKey = '';
    }

    const payload: SmartPickSettingsExport = {
      schemaVersion: 1,
      pluginId: this.plugin.manifest.id,
      pluginVersion: this.plugin.manifest.version,
      exportedAt: new Date().toISOString(),
      includesApiKey: this.exportIncludesApiKey,
      settings: exportedSettings,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const urlApi = activeWindow as Window & { URL: typeof URL };
    const url = urlApi.URL.createObjectURL(blob);
    const link = activeDocument.body.createEl('a', {
      attr: {
        href: url,
        download: `smartpick-settings-${this.createTimestamp()}.json`,
      },
    });

    link.click();
    link.remove();
    urlApi.URL.revokeObjectURL(url);
    new Notice(localize('配置已导出', 'Settings exported'));
  }

  private chooseSettingsImportFile(): void {
    const input = activeDocument.body.createEl('input', {
      attr: {
        type: 'file',
        accept: 'application/json,.json',
      },
    });
    input.addClass('smartpick-hidden-file-input');

    input.addEventListener('change', () => {
      void (async () => {
        const file = input.files?.[0];
        input.remove();
        if (!file) return;
        await this.readSettingsImportFile(file);
      })();
    });

    input.click();
  }

  private async readSettingsImportFile(file: File): Promise<void> {
    try {
      const parsed = this.parseImportedSettings(JSON.parse(await file.text()) as unknown);
      new ImportSettingsConfirmModal(this.app, file.name, async () => {
        await this.applyImportedSettings(parsed);
      }).open();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      new Notice(`${localize('导入失败', 'Import failed')}: ${message}`);
    }
  }

  private async applyImportedSettings(parsed: ParsedSettingsImport): Promise<void> {
    const settings = parsed.settings;
    if (parsed.includesApiKey === false) {
      settings.aiConfig.apiKey = this.plugin.settings.aiConfig.apiKey;
    }

    await this.plugin.backupSettings('before-import');
    this.plugin.settings = settings;
    await this.plugin.saveSettings();
    await this.plugin.loadSettings();
    this.refresh();
    new Notice(localize('配置已导入', 'Settings imported'));
  }

  private parseImportedSettings(raw: unknown): ParsedSettingsImport {
    if (!this.isRecord(raw)) {
      throw new Error(localize('文件不是有效的 JSON 对象', 'File is not a valid JSON object'));
    }

    const includesApiKey = typeof raw.includesApiKey === 'boolean' ? raw.includesApiKey : null;
    const candidate = this.isRecord(raw.settings) ? raw.settings : raw;
    if (!Array.isArray(candidate.toolbarItems) && !this.isRecord(candidate.aiConfig)) {
      throw new Error(localize('未找到 SmartPick 配置字段', 'SmartPick settings fields were not found'));
    }

    const defaults = this.cloneSettings(DEFAULT_SETTINGS);
    const imported = candidate as Partial<SmartPickSettings>;
    const importedAiConfig = this.isRecord(candidate.aiConfig) ? imported.aiConfig : undefined;

    return {
      includesApiKey,
      settings: {
        ...defaults,
        ...imported,
        toolbarItems: Array.isArray(imported.toolbarItems) ? imported.toolbarItems : defaults.toolbarItems,
        aiConfig: {
          ...defaults.aiConfig,
          ...(importedAiConfig ?? {}),
        },
      },
    };
  }

  private cloneSettings(settings: SmartPickSettings): SmartPickSettings {
    return JSON.parse(JSON.stringify(settings)) as SmartPickSettings;
  }

  private createTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private getProvider() {
    const providerType = this.plugin.settings.aiConfig.provider;
    switch (providerType) {
      case 'anthropic':
        return new AnthropicProvider();
      case 'ollama':
        return new OllamaProvider();
      default:
        return new OpenAIProvider();
  }
}

  private showAddCommandModal(): void {
    new CommandModal(this.plugin.app, undefined, (id, tooltip, icon) => {
      void (async () => {
          const newItem: ToolbarItem = {
            id: generateId(),
            type: 'command',
            icon: icon || 'command',
            tooltip: tooltip,
            enabled: true,
            commandId: id,
            group: 'custom',
            order: this.getNextToolbarOrder(),
          };

          this.plugin.settings.toolbarItems.push(newItem);
          await this.plugin.saveSettings();
          this.refresh();
      })();
    }).open();
  }

  private showAddAICommandModal(): void {
    new AICommandModal(this.plugin.app, null, (name, prompt, icon, outputAction) => {
      void (async () => {
          const newItem: ToolbarItem = {
            id: generateId(),
            type: 'ai',
            icon: icon || 'sparkles',
            tooltip: name,
            enabled: true,
            prompt,
            outputAction,
            isBuiltin: false,
            group: 'custom',
            order: this.getNextToolbarOrder(),
          };

          this.plugin.settings.toolbarItems.push(newItem);
          await this.plugin.saveSettings();
          this.refresh();
      })();
    }).open();
  }

  private showAddUrlCommandModal(): void {
    new UrlCommandModal(this.plugin.app, undefined, (name, url, icon) => {
      void (async () => {
          const newItem: ToolbarItem = {
            id: generateId(),
            type: 'url',
            icon: icon || 'link',
            tooltip: name,
            enabled: true,
            url: url,
            group: 'custom',
            order: this.getNextToolbarOrder(),
          };

          this.plugin.settings.toolbarItems.push(newItem);
          await this.plugin.saveSettings();
          this.refresh();
      })();
    }).open();
  }

  private showAddShortcutModal(): void {
    new ShortcutModal(this.plugin.app, undefined, (name, keys, icon) => {
      void (async () => {
          const newItem: ToolbarItem = {
            id: generateId(),
            type: 'shortcut',
            icon: icon || 'keyboard',
            tooltip: name,
            enabled: true,
            shortcutKeys: keys,
            group: 'custom',
            order: this.getNextToolbarOrder(),
          };

          this.plugin.settings.toolbarItems.push(newItem);
          await this.plugin.saveSettings();
          this.refresh();
      })();
    }).open();
  }

  private getNextToolbarOrder(): number {
    return Math.max(-1, ...this.plugin.settings.toolbarItems.map((item) => item.order)) + 1;
  }

  private async removeToolbarItem(id: string): Promise<void> {
    this.plugin.settings.toolbarItems = this.plugin.settings.toolbarItems.filter(
      item => item.id !== id
    );
    await this.plugin.saveSettings();
    this.refresh();
  }

}

class ImportSettingsConfirmModal extends Modal {
  private fileName: string;
  private onConfirmImport: () => Promise<void>;

  constructor(app: App, fileName: string, onConfirmImport: () => Promise<void>) {
    super(app);
    this.fileName = fileName;
    this.onConfirmImport = onConfirmImport;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('smartpick-confirm-modal');

    contentEl.createEl('h2', { text: localize('导入 SmartPick 配置？', 'Import SmartPick settings?') });
    contentEl.createEl('p', {
      text: localize(
        `将导入 ${this.fileName}。当前配置会先自动备份，然后被导入内容覆盖。`,
        `This will import ${this.fileName}. Current settings will be backed up first, then replaced.`
      ),
    });

    const buttonContainer = contentEl.createDiv('smartpick-confirm-buttons');

    new ButtonComponent(buttonContainer)
      .setButtonText(localize('取消', 'Cancel'))
      .onClick(() => {
        this.close();
      });

    const importButton = new ButtonComponent(buttonContainer)
      .setButtonText(localize('导入', 'Import'))
      .setCta()
      .onClick(() => {
        void (async () => {
          importButton.setDisabled(true);
          await this.onConfirmImport();
          this.close();
        })();
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
