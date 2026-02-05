import { App, Modal, Setting, Notice, setIcon, TextComponent } from 'obsidian';
import { t } from '../i18n';
import { PromptTemplate } from '../settings';
import { CommandSuggester, IconSuggester } from './Suggesters';

export class EditTemplateModal extends Modal {
  private resultName: string = '';
  private resultCategory: string = 'Custom';
  private resultPrompt: string = '';
  private isEditing: boolean = false;
  private onSubmit: (name: string, category: string, prompt: string) => void;

  constructor(
    app: App, 
    template: PromptTemplate | undefined, 
    onSubmit: (name: string, category: string, prompt: string) => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    if (template) {
        this.isEditing = true;
        this.resultName = template.name;
        this.resultCategory = template.category;
        this.resultPrompt = template.prompt;
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.isEditing ? t('editTemplate') : t('addNewTemplate') });

    // Name
    new Setting(contentEl)
      .setName(t('templateName'))
      .addText(text => text
        .setValue(this.resultName)
        .onChange(value => this.resultName = value));

    // Category
    new Setting(contentEl)
      .setName(t('templateCategory'))
      .addText(text => text
        .setValue(this.resultCategory)
        .onChange(value => this.resultCategory = value));

    // Prompt (TextArea)
    new Setting(contentEl)
      .setName(t('templatePrompt'))
      .addTextArea(text => {
        text
          .setValue(this.resultPrompt)
          .setPlaceholder('{{selection}}')
          .onChange(value => this.resultPrompt = value);
        text.inputEl.rows = 6;
        text.inputEl.addClass('smartpick-full-width');
      });

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(this.isEditing ? 'Save' : 'Add')
        .setCta()
        .onClick(() => {
          if (!this.resultName || !this.resultPrompt) {
            new Notice(t('error')); // Or specific message
            return;
          }
          this.close();
          this.onSubmit(this.resultName, this.resultCategory, this.resultPrompt);
        }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export interface CommandData {
  id: string;
  tooltip: string;
  icon: string;
}

export class CommandModal extends Modal {
  private resultId: string = '';
  private resultTooltip: string = '';
  private resultIcon: string = 'command';
  private isEditing: boolean = false;
  private onSubmit: (id: string, tooltip: string, icon: string) => void;

  constructor(
    app: App, 
    initialData: CommandData | undefined,
    onSubmit: (id: string, tooltip: string, icon: string) => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    if (initialData) {
        this.isEditing = true;
        this.resultId = initialData.id;
        this.resultTooltip = initialData.tooltip;
        this.resultIcon = initialData.icon;
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.isEditing ? t('editCommand') : t('addCommand') });

    // Command Selection
    let commandIdText: TextComponent;
    let tooltipText: TextComponent;
    let iconText: TextComponent;
    let iconPreview: HTMLElement;
    
    new Setting(contentEl)
      .setName(t('enterCommandId'))
      .addText(text => {
        commandIdText = text;
        text.setPlaceholder('editor:toggle-bold')
            .setValue(this.resultId)
            .onChange(value => this.resultId = value);
      })
      .addButton(btn => btn
        .setButtonText(t('selectCommand'))
        .onClick(() => {
          new CommandSuggester(this.app, (command) => {
            this.resultId = command.id;
            this.resultTooltip = command.name;
            this.resultIcon = (command as any).icon || 'command'; 
            
            // Update UI
            commandIdText.setValue(this.resultId);
            tooltipText.setValue(this.resultTooltip);
            iconText.setValue(this.resultIcon);
            updateIconPreview(this.resultIcon);
          }).open();
        }));

    // Tooltip Input
    new Setting(contentEl)
      .setName(t('enterTooltip'))
      .addText(text => {
        tooltipText = text;
        text.setValue(this.resultTooltip)
            .onChange(value => this.resultTooltip = value);
      });

    // Icon Input
    const iconSetting = new Setting(contentEl)
      .setName(t('enterIconName'))
      .addText(text => {
        iconText = text;
        text.setValue(this.resultIcon)
            .setPlaceholder('command')
            .onChange(value => {
              this.resultIcon = value;
              updateIconPreview(value);
            });
      })
      .addButton(btn => btn
        .setButtonText(t('selectIcon'))
        .onClick(() => {
          new IconSuggester(this.app, (icon) => {
            this.resultIcon = icon;
            iconText.setValue(icon);
            updateIconPreview(icon);
          }).open();
        }));
        
    // Add icon preview
    iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview(this.resultIcon);

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(this.isEditing ? t('save') : t('addCommand'))
        .setCta()
        .onClick(() => {
          if (!this.resultId) {
            new Notice('Command ID is required');
            return;
          }
          this.close();
          this.onSubmit(this.resultId, this.resultTooltip, this.resultIcon);
        }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export interface AICommandData {
  templateId: string;
  icon: string;
}

export class AICommandModal extends Modal {
  private selectedTemplateId: string = '';
  private resultIcon: string = 'sparkles';
  private templates: PromptTemplate[];
  private isEditing: boolean = false;
  private onSubmit: (templateId: string, icon: string) => void;

  constructor(
    app: App, 
    templates: PromptTemplate[], 
    initialData: AICommandData | undefined, 
    onSubmit: (templateId: string, icon: string) => void
  ) {
    super(app);
    this.templates = templates;
    this.onSubmit = onSubmit;
    if (initialData) {
        this.isEditing = true;
        this.selectedTemplateId = initialData.templateId;
        this.resultIcon = initialData.icon;
    } else if (templates.length > 0) {
      this.selectedTemplateId = templates[0].id;
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.isEditing ? t('editAICommand') : t('addAICommand') });

    // Template Selection
    new Setting(contentEl)
      .setName(t('selectTemplateId'))
      .addDropdown(dropdown => {
        this.templates.forEach(template => {
          dropdown.addOption(template.id, template.name);
        });
        dropdown.setValue(this.selectedTemplateId);
        dropdown.onChange(value => {
          this.selectedTemplateId = value;
        });
      });

    // Icon Input
    let iconText: TextComponent;
    let iconPreview: HTMLElement;

    const iconSetting = new Setting(contentEl)
      .setName(t('enterIconName'))
      .addText(text => {
        iconText = text;
        text.setValue(this.resultIcon)
            .setPlaceholder('sparkles')
            .onChange(value => {
              this.resultIcon = value;
              updateIconPreview(value);
            });
      })
      .addButton(btn => btn
        .setButtonText(t('selectIcon'))
        .onClick(() => {
          new IconSuggester(this.app, (icon) => {
            this.resultIcon = icon;
            iconText.setValue(icon);
            updateIconPreview(icon);
          }).open();
        }));
    
    iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview(this.resultIcon);

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(this.isEditing ? t('save') : t('addAICommand'))
        .setCta()
        .onClick(() => {
          if (!this.selectedTemplateId) {
            new Notice(t('templateNotFound'));
            return;
          }
          this.close();
          this.onSubmit(this.selectedTemplateId, this.resultIcon);
        }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export class AddGroupModal extends Modal {
  private resultName: string = '';
  private onSubmit: (name: string) => void;

  constructor(app: App, onSubmit: (name: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: t('newGroup') });

    // Name Input
    new Setting(contentEl)
      .setName(t('enterGroupName'))
      .addText(text => text
        .onChange(value => {
          this.resultName = value;
        }));

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText('Create') // Need translation key, fallback to english or add key? Using 'Create' for now.
        .setCta()
        .onClick(() => {
            if (!this.resultName) {
                new Notice('Group name is required');
                return;
            }
          this.close();
          this.onSubmit(this.resultName);
        }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export interface UrlCommandData {
  name: string;
  url: string;
  icon: string;
}

export class UrlCommandModal extends Modal {
  private resultName: string = '';
  private resultUrl: string = '';
  private resultIcon: string = 'link';
  private isEditing: boolean = false;
  private onSubmit: (name: string, url: string, icon: string) => void;

  constructor(
    app: App, 
    initialData: UrlCommandData | undefined,
    onSubmit: (name: string, url: string, icon: string) => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    if (initialData) {
        this.isEditing = true;
        this.resultName = initialData.name;
        this.resultUrl = initialData.url;
        this.resultIcon = initialData.icon;
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.isEditing ? t('editUrlCommand') : t('addUrlCommand') });

    // Name Input
    new Setting(contentEl)
      .setName(t('enterName'))
      .addText(text => text
        .setValue(this.resultName)
        .setPlaceholder('Google / Shortcut Name')
        .onChange(value => this.resultName = value));

    // URL Input
    new Setting(contentEl)
      .setName(t('enterUrl'))
      .addText(text => {
        text.setValue(this.resultUrl)
            .setPlaceholder('https://... or shortcuts://...')
            .onChange(value => this.resultUrl = value);
        text.inputEl.addClass('smartpick-full-width');
      });

    // Icon Input
    let iconText: TextComponent;
    let iconPreview: HTMLElement;
    
    const iconSetting = new Setting(contentEl)
      .setName(t('enterIconName'))
      .addText(text => {
        iconText = text;
        text.setValue(this.resultIcon)
            .setPlaceholder('link')
            .onChange(value => {
              this.resultIcon = value;
              updateIconPreview(value);
            });
      })
      .addButton(btn => btn
        .setButtonText(t('selectIcon'))
        .onClick(() => {
          new IconSuggester(this.app, (icon) => {
            this.resultIcon = icon;
            iconText.setValue(icon);
            updateIconPreview(icon);
          }).open();
        }));
        
    iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview(this.resultIcon);

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(this.isEditing ? t('save') : t('addCommand'))
        .setCta()
        .onClick(() => {
          if (!this.resultName || !this.resultUrl) {
            new Notice('Name and URL are required');
            return;
          }
          this.close();
          this.onSubmit(this.resultName, this.resultUrl, this.resultIcon);
        }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export interface ShortcutData {
  name: string;
  keys: string;
  icon: string;
}

export class ShortcutModal extends Modal {
  private resultName: string = '';
  private resultKeys: string = '';
  private resultIcon: string = 'keyboard';
  private isEditing: boolean = false;
  private onSubmit: (name: string, keys: string, icon: string) => void;

  constructor(
    app: App, 
    initialData: ShortcutData | undefined,
    onSubmit: (name: string, keys: string, icon: string) => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    if (initialData) {
        this.isEditing = true;
        this.resultName = initialData.name;
        this.resultKeys = initialData.keys;
        this.resultIcon = initialData.icon;
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.isEditing ? t('editShortcutCommand') : t('addShortcutCommand') });

    // Name Input
    new Setting(contentEl)
      .setName(t('enterName'))
      .addText(text => text
        .setValue(this.resultName)
        .setPlaceholder('Screenshot / App Name')
        .onChange(value => this.resultName = value));

    // Shortcut Input
    new Setting(contentEl)
      .setName(t('enterShortcut'))
      .addText(text => {
        text.setPlaceholder('Press keys (e.g. Cmd+Shift+S)')
            .setValue(this.resultKeys)
            .onChange(value => this.resultKeys = value);
        
        text.inputEl.addClass('smartpick-full-width');
        
        text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
          e.preventDefault();
          e.stopPropagation();

          const modifiers: string[] = [];
          if (e.metaKey) modifiers.push('Cmd');
          if (e.ctrlKey) modifiers.push('Ctrl');
          if (e.altKey) modifiers.push('Opt');
          if (e.shiftKey) modifiers.push('Shift');

          let key = e.key.toUpperCase();
          
          // Handle special keys
          if (key === 'CONTROL' || key === 'META' || key === 'ALT' || key === 'SHIFT') {
            // Just modifiers pressed
            text.setValue(modifiers.join('+'));
            return;
          }

          // Map arrow keys and others if needed, using e.code or e.key
          if (e.code.startsWith('Key')) key = e.code.slice(3);
          else if (e.code.startsWith('Digit')) key = e.code.slice(5);
          else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Backspace', 'Tab', 'Space'].includes(e.code)) {
             key = e.code;
          }

          const shortcut = [...modifiers, key].join('+');
          this.resultKeys = shortcut;
          text.setValue(shortcut);
        });
      });

    // Icon Input
    let iconText: TextComponent;
    let iconPreview: HTMLElement;
    
    const iconSetting = new Setting(contentEl)
      .setName(t('enterIconName'))
      .addText(text => {
        iconText = text;
        text.setValue(this.resultIcon)
            .setPlaceholder('keyboard')
            .onChange(value => {
              this.resultIcon = value;
              updateIconPreview(value);
            });
      })
      .addButton(btn => btn
        .setButtonText(t('selectIcon'))
        .onClick(() => {
          new IconSuggester(this.app, (icon) => {
            this.resultIcon = icon;
            iconText.setValue(icon);
            updateIconPreview(icon);
          }).open();
        }));
        
    iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview(this.resultIcon);

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(this.isEditing ? t('save') : t('addCommand'))
        .setCta()
        .onClick(() => {
          if (!this.resultName || !this.resultKeys) {
            new Notice('Name and Shortcut keys are required');
            return;
          }
          this.close();
          this.onSubmit(this.resultName, this.resultKeys, this.resultIcon);
        }));
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
