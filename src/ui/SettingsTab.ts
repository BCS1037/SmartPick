// SmartPick Settings Tab - Plugin settings UI

import { App, PluginSettingTab, Setting, setIcon, Notice } from 'obsidian';
import type SmartPickPlugin from '../main';
import { 
  ToolbarItem, 
  PromptTemplate, 
  CommandGroup,
  generateId,
  AIProvider
} from '../settings';
import { t, detectLanguage, setLanguage, I18nStrings } from '../i18n';
import { OpenAIProvider } from '../ai/providers/OpenAIProvider';
import { AnthropicProvider } from '../ai/providers/AnthropicProvider';
import { OllamaProvider } from '../ai/providers/OllamaProvider';
import { AddCommandModal, AddAICommandModal, AddGroupModal, EditTemplateModal } from './Modals';
import { ConfirmModal } from './ConfirmModal';

type TabId = 'toolbar' | 'ai' | 'templates';

export class SmartPickSettingTab extends PluginSettingTab {
  plugin: SmartPickPlugin;
  activeTab: TabId = 'toolbar';

  constructor(app: App, plugin: SmartPickPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('smartpick-settings');

    // Title
    new Setting(containerEl)
        .setName(t('settingsTitle'))
        .setHeading();

    // Render Tabs
    const tabsContainer = containerEl.createDiv('smartpick-settings-tabs');
    this.renderTab(tabsContainer, 'toolbar', t('toolbarSettings'));
    this.renderTab(tabsContainer, 'ai', t('aiSettings'));
    this.renderTab(tabsContainer, 'templates', t('promptTemplates'));

    // Render Content based on active tab
    const contentContainer = containerEl.createDiv('smartpick-settings-tab-content');
    
    switch (this.activeTab) {
      case 'toolbar':
        this.renderToolbarSettings(contentContainer);
        break;
      case 'ai':
        this.renderAISettings(contentContainer);
        break;
      case 'templates':
        this.renderPromptTemplates(contentContainer);
        break;
    }
  }

  private renderTab(container: HTMLElement, id: TabId, label: string): void {
    const tab = container.createDiv('smartpick-settings-tab');
    tab.setText(label);
    if (this.activeTab === id) {
      tab.addClass('active');
    }
    tab.addEventListener('click', () => {
      this.activeTab = id;
      this.display();
    });
  }

  private renderToolbarSettings(containerEl: HTMLElement): void {
    // Language
    new Setting(containerEl)
      .setName(t('language'))
      .setDesc(t('languageDesc'))
      .addDropdown(dropdown => {
        dropdown
          .addOption('auto', t('auto'))
          .addOption('zh', t('zh'))
          .addOption('en', t('en'))
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value as 'auto' | 'zh' | 'en';
            await this.plugin.saveSettings();
            // Reload i18n
            const lang = value === 'auto' ? detectLanguage() : value;
            setLanguage(lang as 'en' | 'zh');
            // Refresh settings
            this.display();
          });
      });

    // Toolbar delay setting
    new Setting(containerEl)
      .setName(t('toolbarDelay'))
      .setDesc(t('toolbarDelayDesc'))
      .addSlider(slider => slider
        .setLimits(0, 1000, 50)
        .setValue(this.plugin.settings.toolbarDelay)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.toolbarDelay = value;
          await this.plugin.saveSettings();
        })
      );

    // Toolbar Vertical Offset
    new Setting(containerEl)
    // Toolbar Vertical Offset
    new Setting(containerEl)
      .setName(t('toolbarVerticalOffset'))
      .setDesc(t('toolbarVerticalOffsetDesc'))
      .addSlider(slider => slider
        .setLimits(0, 100, 1)
        .setValue(this.plugin.settings.toolbarOffsetTop)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.toolbarOffsetTop = value;
          await this.plugin.saveSettings();
        })
      );

    // Toolbar Horizontal Offset
    new Setting(containerEl)
    // Toolbar Horizontal Offset
    new Setting(containerEl)
      .setName(t('toolbarHorizontalOffset'))
      .setDesc(t('toolbarHorizontalOffsetDesc'))
      .addSlider(slider => slider
        .setLimits(-100, 100, 1)
        .setValue(this.plugin.settings.toolbarOffsetLeft)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.toolbarOffsetLeft = value;
          await this.plugin.saveSettings();
        })
      );

    // Toolbar items list
    const itemsContainer = containerEl.createDiv('smartpick-toolbar-items');
    
    // Group items by group
    const groups = new Map<string, ToolbarItem[]>();
    for (const item of this.plugin.settings.toolbarItems) {
      const groupId = item.group || 'ungrouped';
      if (!groups.has(groupId)) {
        groups.set(groupId, []);
      }
      groups.get(groupId)!.push(item);
    }

    // Render each group
    for (const group of this.plugin.settings.commandGroups) {
      const items = groups.get(group.id) || [];
      this.renderToolbarGroup(itemsContainer, group, items);
    }

    // Render ungrouped items
    const ungroupedItems = groups.get('ungrouped') || [];
    this.renderToolbarGroup(
      itemsContainer, 
      { id: 'ungrouped', name: t('group_ungrouped_name'), order: 999 },
      ungroupedItems
    );

    // Buttons
    const buttonsContainer = containerEl.createDiv('smartpick-settings-buttons');

    new Setting(buttonsContainer)
      .addButton(button => {
        button.setButtonText(t('addCommand'));
        button.setCta();
        button.onClick(() => this.showAddCommandModal());
      });

    new Setting(buttonsContainer)
      .addButton(button => {
        button.setButtonText(t('addAICommand'));
        button.onClick(() => this.showAddAICommandModal());
      });

    new Setting(buttonsContainer)
      .addButton(button => {
        button.setButtonText(t('newGroup'));
        button.onClick(() => this.addNewGroup());
      });
  }

  private renderToolbarGroup(
    container: HTMLElement, 
    group: CommandGroup, 
    items: ToolbarItem[]
  ): void {
    const groupEl = container.createDiv('smartpick-toolbar-group');
    const header = groupEl.createDiv('smartpick-toolbar-group-header');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    const isBuiltinGroup = ['format', 'ai', 'ungrouped'].includes(group.id);
    const groupName = isBuiltinGroup ? t(('group_' + group.id) as keyof I18nStrings) || group.name : group.name;
    
    header.createEl('h4', { text: groupName, cls: 'smartpick-group-title' });

    if (group.id !== 'ungrouped' && group.id !== 'format' && group.id !== 'ai') {
        const deleteBtn = header.createEl('button', { cls: 'smartpick-group-delete' });
        setIcon(deleteBtn, 'trash-2');
        deleteBtn.setAttribute('aria-label', 'Delete Group');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            new ConfirmModal(
                this.plugin.app,
                'Delete Group',
                `Delete group "${group.name}"? Items will be moved to Ungrouped.`,
                async () => {
                    await this.removeGroup(group.id);
                },
                'Delete'
            ).open();
        });
    }

    const listEl = groupEl.createDiv('smartpick-toolbar-group-items');
    
    // Add drag-over handler to the list container to allow dropping into empty groups or at end
    listEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      listEl.addClass('smartpick-drag-over');
    });

    listEl.addEventListener('dragleave', (e) => {
      listEl.removeClass('smartpick-drag-over');
    });

    listEl.addEventListener('drop', async (e) => {
      e.preventDefault();
      listEl.removeClass('smartpick-drag-over');
      const draggedId = e.dataTransfer!.getData('text/plain');
      const draggedItem = this.plugin.settings.toolbarItems.find(i => i.id === draggedId);
      
      if (!draggedItem) return;

      // If dropped directly on list (not on an item), move to this group at the end
      if (e.target === listEl) {
        draggedItem.group = group.id;
        // Recalculate orders
        this.reorderItems();
        await this.plugin.saveSettings();
        this.display();
      }
    });
    
    for (const item of items.sort((a, b) => a.order - b.order)) {
      if (item.type === 'separator') continue;

      const itemEl = listEl.createDiv('smartpick-toolbar-item');
      itemEl.setAttribute('draggable', 'true');
      
      // Drag Start
      itemEl.addEventListener('dragstart', (e) => {
        e.dataTransfer!.setData('text/plain', item.id);
        itemEl.addClass('smartpick-sortable-drag');
        // setTimeout to hide the element but keep it in DOM for drag image
        setTimeout(() => itemEl.addClass('smartpick-sortable-ghost'), 0);
      });

      // Drag End
      itemEl.addEventListener('dragend', (e) => {
        itemEl.removeClass('smartpick-sortable-drag');
        itemEl.removeClass('smartpick-sortable-ghost');
        document.querySelectorAll('.smartpick-drag-over').forEach(el => el.removeClass('smartpick-drag-over'));
      });

      // Drag Over (Item level)
      itemEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Handle drop on item vs list
        itemEl.addClass('smartpick-drag-over-item');
      });

      // Drag Leave
      itemEl.addEventListener('dragleave', (e) => {
        itemEl.removeClass('smartpick-drag-over-item');
      });

      // Drop on Item
      itemEl.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        itemEl.removeClass('smartpick-drag-over-item');
        
        const draggedId = e.dataTransfer!.getData('text/plain');
        if (draggedId === item.id) return;

        const allItems = this.plugin.settings.toolbarItems;
        const draggedItem = allItems.find(i => i.id === draggedId);
        
        if (draggedItem) {
            // Move dragged item to this group info
            draggedItem.group = group.id;
            
            // Reorder: insert dragged item before the drop target
            const groupItems = allItems.filter(i => i.group === group.id).sort((a, b) => a.order - b.order);
            const targetIndex = groupItems.findIndex(i => i.id === item.id);
            const draggedIndex = groupItems.findIndex(i => i.id === draggedId);
            
            // Remove from old position (if in same group logic) 
            // Actually it's easier to just rebuild the array or use logic
            
            // Simple logic: Assign new orders based on position
            // But dragging across groups complicates "index".
            
            // Strategy: 
            // 1. Remove draggedItem from allItems logic reference (conceptually)
            // 2. Insert it at targetIndex in this group
            
            // Let's rely on simple reordering:
            // We want draggedItem to have an order just before targetItem
            
            // Let's set the order of draggedItem to targetItem.order - 0.5 temporarily and sort?
            // Or better, just re-process the list.
            
            draggedItem.order = item.order - 0.5; 
            
            // Normalize orders
            this.reorderItems();
            
            await this.plugin.saveSettings();
            this.display();
        }
      });
      
      // Icon
      const iconEl = itemEl.createSpan('smartpick-toolbar-item-icon');
      if (item.icon) {
        setIcon(iconEl, item.icon);
      }

      // Name
      let tooltip = item.tooltip;
      // Identify built-in commands by ID pattern or hardcoded check
      // Commands: bold, italic, highlight
      // AI: ai-translate, ai-summarize, ai-explain
      if (['bold', 'italic', 'highlight'].includes(item.id)) {
        tooltip = t(('command_' + item.id) as keyof I18nStrings);
      } else if (['ai-translate', 'ai-summarize', 'ai-explain'].includes(item.id)) {
        tooltip = t(('command_' + item.id.replace('-', '_')) as keyof I18nStrings);
      }

      itemEl.createSpan({ text: tooltip, cls: 'smartpick-toolbar-item-name' });

      // Type badge
      if (item.type === 'ai') {
        itemEl.createSpan({ text: 'AI', cls: 'smartpick-toolbar-item-badge' });
      }

      // Delete button
      const deleteBtn = itemEl.createEl('button', { cls: 'smartpick-toolbar-item-delete' });
      setIcon(deleteBtn, 'trash-2');
      deleteBtn.addEventListener('click', () => this.removeToolbarItem(item.id));
    }
  }

  private reorderItems() {
      // Group items, sort by order, then re-assign integer orders
      const groups = new Set(this.plugin.settings.toolbarItems.map(i => i.group));
      const items = this.plugin.settings.toolbarItems;
      
      // Process each group
      groups.forEach(groupId => {
          const groupItems = items.filter(i => i.group === groupId);
          groupItems.sort((a, b) => a.order - b.order);
          groupItems.forEach((item, index) => {
              item.order = index;
          });
      });
  }

  private renderAISettings(containerEl: HTMLElement): void {
    // containerEl.createEl('h2', { text: t('aiSettings') }); // Removed redundant header

    const { aiConfig } = this.plugin.settings;

    // Provider
    new Setting(containerEl)
    // Provider
    new Setting(containerEl)
      .setName(t('apiProvider'))
      .setDesc(t('apiProviderDesc'))
      .addDropdown(dropdown => {
        dropdown
          .addOption('openai', 'OpenAI')
          .addOption('anthropic', 'Anthropic')
          .addOption('ollama', 'Ollama')
          .addOption('custom', 'Custom (OpenAI Compatible)')
          .setValue(aiConfig.provider)
          .onChange(async (value) => {
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
            this.display();
          });
      });

    // API URL
    new Setting(containerEl)
      .setName(t('apiUrl'))
      .setDesc('Base URL for the API')
      .addText(text => {
        text
          .setPlaceholder('https://api.openai.com/v1')
          .setValue(aiConfig.apiUrl)
          .onChange(async (value) => {
            aiConfig.apiUrl = value;
            await this.plugin.saveSettings();
          });
      });

    // API Key (not for Ollama)
    if (aiConfig.provider !== 'ollama') {
      new Setting(containerEl)
        .setName(t('apiKey'))
        .setDesc('Secret API Key (stored securely)')
        .addText(text => {
          text
            .setPlaceholder('sk-...')
            .setValue(aiConfig.apiKey)
            .inputEl.type = 'password';
          text.onChange(async (value) => {
            aiConfig.apiKey = value;
            await this.plugin.saveSettings();
          });
        });
    }

    // Fetch Models button
    new Setting(containerEl)
      .setName(t('fetchModels'))
      .setDesc('Retrieve available models from the provider')
      .addButton(button => {
        button.setButtonText(t('fetchModels'));
        button.onClick(async () => {
          button.setButtonText(t('fetchingModels'));
          button.setDisabled(true);
          
          try {
            const provider = this.getProvider();
            const models = await provider.fetchModels(aiConfig);
            aiConfig.availableModels = models;
            await this.plugin.saveSettings();
            new Notice(t('success') + `: ${models.length} models`);
            this.display();
          } catch (error) {
            new Notice(t('connectionFailed'));
            console.error('Failed to fetch models:', error);
          } finally {
            button.setButtonText(t('fetchModels'));
            button.setDisabled(false);
          }
        });
      });

    // Model selection
    const modelsSetting = new Setting(containerEl)
      .setName(t('selectModel'))
      .setDesc(t('selectModelDesc'));

    if (aiConfig.availableModels.length > 0) {
      modelsSetting.addDropdown(dropdown => {
        for (const model of aiConfig.availableModels) {
          dropdown.addOption(model, model);
        }
        dropdown.setValue(aiConfig.defaultModel);
        dropdown.onChange(async (value) => {
          aiConfig.defaultModel = value;
          await this.plugin.saveSettings();
        });
      });
    } else {
      modelsSetting.addText(text => {
        text
          .setPlaceholder('gpt-4o-mini')
          .setValue(aiConfig.defaultModel)
          .onChange(async (value) => {
            aiConfig.defaultModel = value;
            await this.plugin.saveSettings();
          });
      });
    }

    // Parameters
    containerEl.createEl('h3', { text: 'Parameters' });
    
    new Setting(containerEl)
    new Setting(containerEl)
      .setName(t('temperature'))
      .setDesc(t('temperatureDesc'))
      .addSlider(slider => slider
        .setLimits(0, 1, 0.1)
        .setValue(aiConfig.temperature)
        .setDynamicTooltip()
        .onChange(async (value) => {
          aiConfig.temperature = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
    new Setting(containerEl)
      .setName(t('maxTokens'))
      .setDesc(t('maxTokensDesc'))
      .addText(text => text
        .setValue(String(aiConfig.maxTokens))
        .onChange(async (value) => {
          const num = parseInt(value);
          if (!isNaN(num)) {
            aiConfig.maxTokens = num;
            await this.plugin.saveSettings();
          }
        })
      );
  }

  private renderPromptTemplates(containerEl: HTMLElement): void {
    // containerEl.createEl('h2', { text: t('promptTemplates') }); // Removed redundant header

    // Add template button
    new Setting(containerEl)
      .setName(t('addNewTemplate'))
      .addButton(button => {
        button.setButtonText(t('addTemplate'));
        button.setCta();
        button.onClick(() => this.showEditTemplateModal());
      });

    // Built-in templates
    containerEl.createEl('h3', { text: t('defaultTemplates') });
    const builtinList = containerEl.createDiv('smartpick-template-list');
    
    for (const template of this.plugin.settings.promptTemplates.filter(t => t.isBuiltin)) {
      this.renderTemplateItem(builtinList, template, false);
    }

    // Custom templates
    containerEl.createEl('h3', { text: t('customTemplates') });
    const customList = containerEl.createDiv('smartpick-template-list');
    
    for (const template of this.plugin.settings.promptTemplates.filter(t => !t.isBuiltin)) {
      this.renderTemplateItem(customList, template, true);
    }
  }

  private renderTemplateItem(
    container: HTMLElement, 
    template: PromptTemplate, 
    editable: boolean
  ): void {
    const itemEl = container.createDiv('smartpick-template-item');
    
    // Name and category
    const infoEl = itemEl.createDiv('smartpick-template-info');
    
    let templateName = template.name;
    if (template.isBuiltin) {
        // Map template ID to translation key
        // IDs: translate-en, translate-zh, summarize, explain, improve-writing, fix-grammar, expand, simplify
        const key = 'template_' + template.id.replace(/-/g, '_');
        templateName = t(key as keyof I18nStrings) || template.name;
    }

    infoEl.createSpan({ text: templateName, cls: 'smartpick-template-name' });
    infoEl.createSpan({ text: template.category, cls: 'smartpick-template-category' });

    // Actions
    const actionsEl = itemEl.createDiv('smartpick-template-actions');
    
    const editBtn = actionsEl.createEl('button');
    setIcon(editBtn, editable ? 'pencil' : 'eye');
    editBtn.setAttribute('aria-label', editable ? t('editTemplate') : 'View Template');
    editBtn.addEventListener('click', () => this.showEditTemplateModal(template));

    if (editable) {
      const deleteBtn = actionsEl.createEl('button');
      setIcon(deleteBtn, 'trash-2');
      deleteBtn.setAttribute('aria-label', t('deleteTemplate'));
      deleteBtn.addEventListener('click', () => this.removeTemplate(template.id));
    }
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
    new AddCommandModal(this.plugin.app, (id, tooltip, icon) => {
      const commands = (this.plugin.app as any).commands.commands;
      const command = commands[id];
      if (!command) {
        new Notice(t('commandNotFound'));
        return;
      }

      const newItem: ToolbarItem = {
        id: generateId(),
        type: 'command',
        icon: icon || 'command',
        tooltip: tooltip || command.name,
        commandId: id,
        group: 'ungrouped',
        order: this.plugin.settings.toolbarItems.length,
      };

      this.plugin.settings.toolbarItems.push(newItem);
      this.plugin.saveSettings();
      this.display();
    }).open();
  }

  private showAddAICommandModal(): void {
    new AddAICommandModal(this.plugin.app, this.plugin.settings.promptTemplates, (templateId, icon) => {
      const template = this.plugin.settings.promptTemplates.find(t => t.id === templateId);
      if (!template) {
        new Notice(t('templateNotFound'));
        return;
      }

      const newItem: ToolbarItem = {
        id: generateId(),
        type: 'ai',
        icon: icon || 'sparkles',
        tooltip: template.name,
        promptTemplateId: templateId,
        group: 'ai',
        order: this.plugin.settings.toolbarItems.length,
      };

      this.plugin.settings.toolbarItems.push(newItem);
      this.plugin.saveSettings();
      this.display();
    }).open();
  }

  private addNewGroup(): void {
    new AddGroupModal(this.plugin.app, (name) => {
      const newGroup: CommandGroup = {
        id: generateId(),
        name: name,
        order: this.plugin.settings.commandGroups.length,
      };

      this.plugin.settings.commandGroups.push(newGroup);
      this.plugin.saveSettings();
      this.display();
    }).open();
  }

  private removeToolbarItem(id: string): void {
    this.plugin.settings.toolbarItems = this.plugin.settings.toolbarItems.filter(
      item => item.id !== id
    );
    this.plugin.saveSettings();
    this.display();
  }

  private showEditTemplateModal(template?: PromptTemplate): void {
    const isNew = !template;
    const isBuiltin = template?.isBuiltin;
    
    if (isBuiltin) {
      new Notice(t('cantEditBuiltin'));
      return; 
    }

    new EditTemplateModal(this.plugin.app, template, (name, category, prompt) => {
        if (isNew) {
            const newTemplate: PromptTemplate = {
                id: generateId(),
                name: name,
                category: category || 'Custom',
                prompt: prompt,
                outputAction: 'replace',
                isBuiltin: false,
            };
            this.plugin.settings.promptTemplates.push(newTemplate);
        } else if (template) {
            template.name = name;
            template.category = category;
            template.prompt = prompt;
        }

        this.plugin.saveSettings();
        this.display();
    }).open();
  }

  private removeTemplate(id: string): void {
    new ConfirmModal(
        this.plugin.app,
        t('deleteTemplate'),
        t('deleteTemplate') + '?',
        () => {
            this.plugin.settings.promptTemplates = this.plugin.settings.promptTemplates.filter(
                t => t.id !== id
            );
            this.plugin.saveSettings();
            this.display();
        },
        'Delete'
    ).open();
  }

  private async removeGroup(groupId: string): Promise<void> {
    // Move items to ungrouped
    this.plugin.settings.toolbarItems.forEach(item => {
        if (item.group === groupId) {
            item.group = 'ungrouped';
        }
    });

    // Remove group
    this.plugin.settings.commandGroups = this.plugin.settings.commandGroups.filter(g => g.id !== groupId);
    
    await this.plugin.saveSettings();
    this.display();
  }
}
