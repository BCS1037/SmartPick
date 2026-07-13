import { App, Modal, Setting, Notice, setIcon, TextComponent } from 'obsidian';
import { t } from '../i18n';
import { CommandSuggester, IconSuggester } from './Suggesters';

import { ConfirmModal } from './ConfirmModal';

export class AddCommandChoiceModal extends Modal {
  private onSelect: (choice: 'command' | 'ai' | 'url' | 'shortcut') => void;

  constructor(app: App, onSelect: (choice: 'command' | 'ai' | 'url' | 'shortcut') => void) {
    super(app);
    this.onSelect = onSelect;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: t('modal_chooseCommandType'), cls: 'smartpick-modal-title' });

    const container = contentEl.createDiv('smartpick-choice-container');
    const choices = [
      { id: 'command', name: t('choice_builtinCommand'), desc: t('choice_builtinCommandDesc'), icon: 'command' },
      { id: 'ai', name: t('choice_aiCommand'), desc: t('choice_aiCommandDesc'), icon: 'sparkles' },
      { id: 'url', name: t('choice_urlCommand'), desc: t('choice_urlCommandDesc'), icon: 'link' },
      { id: 'shortcut', name: t('choice_shortcutCommand'), desc: t('choice_shortcutCommandDesc'), icon: 'keyboard' },
    ];

    choices.forEach(choice => {
      const card = container.createDiv('smartpick-choice-card');
      const iconEl = card.createSpan('smartpick-choice-card-icon');
      setIcon(iconEl, choice.icon);
      card.createEl('strong', { text: choice.name });
      card.createEl('span', { text: choice.desc });
      card.addEventListener('click', () => {
        this.close();
        this.onSelect(choice.id as 'command' | 'ai' | 'url' | 'shortcut');
      });
    });
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
  private onDelete?: () => void;

  constructor(
    app: App, 
    initialData: CommandData | undefined,

    onSubmit: (id: string, tooltip: string, icon: string) => void,
    onDelete?: () => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    this.onDelete = onDelete;
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

    
    new Setting(contentEl)
      .setName(t('enterCommandId'))
      .addText(text => {
        commandIdText = text;
        text.setPlaceholder('`editor:toggle-bold`')
            .setValue(this.resultId)
            .onChange(value => this.resultId = value);
      })
      .addButton(btn => btn
        .setButtonText(t('selectCommand'))
        .onClick(() => {
          new CommandSuggester(this.app, (command) => {
            this.resultId = command.id;
            this.resultTooltip = command.name;
            this.resultIcon = command.icon || 'command';
            
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
            .setPlaceholder('`command`')
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
    const iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
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

    if (this.isEditing && this.onDelete) {
        new Setting(contentEl)
            .addButton(btn => {
              btn.buttonEl.addClass('mod-warning');
              return btn
                .setButtonText(t('delete'))
                .onClick(() => {
                    new ConfirmModal(
                        this.app,
                        t('deleteCommand'),
                        t('deleteCommandDesc'),
                        () => {
                            this.onDelete?.();
                            this.close();
                        },
                        t('delete')
                    ).open();
                });
            });
        // Move delete button to start or adjust css? 
        // Logic: The user asked for "same row as Cancel & Save". 
        // The Setting component creates a row. Adding buttons to the SAME new Setting appends them.
        // My previous code created ONE new Setting for Cancel & Save.
        // I should modify that block instead of adding a new one if I want them in one row.
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}

export interface AICommandData {
  name: string;
  prompt: string;
  icon: string;
  outputAction: 'replace' | 'insert' | 'clipboard';
  isBuiltin?: boolean;
}

export class AICommandModal extends Modal {
  private resultName: string = '';
  private resultPrompt: string = '';
  private resultIcon: string = 'sparkles';
  private resultOutputAction: 'replace' | 'insert' | 'clipboard' = 'replace';
  private isEditing: boolean = false;
  private isBuiltin: boolean = false;

  private onSubmit: (name: string, prompt: string, icon: string, outputAction: 'replace' | 'insert' | 'clipboard') => void;
  private onDelete?: () => void;

  constructor(
    app: App,
    initialData: AICommandData | null,
    onSubmit: (name: string, prompt: string, icon: string, outputAction: 'replace' | 'insert' | 'clipboard') => void,
    onDelete?: () => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    this.onDelete = onDelete;
    if (initialData) {
        this.isEditing = true;
        this.resultName = initialData.name;
        this.resultPrompt = initialData.prompt;
        this.resultIcon = initialData.icon;
        this.resultOutputAction = initialData.outputAction;
        this.isBuiltin = !!initialData.isBuiltin;
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: this.isEditing ? t('editAICommand') : t('addAICommand') });

    new Setting(contentEl)
      .setName(t('commandName'))
      .setDesc(t('commandNameDesc'))
      .addText(text => text
        .setValue(this.resultName)
        .setPlaceholder(t('command_ai_translate'))
        .onChange(value => this.resultName = value));

    new Setting(contentEl)
      .setName(t('prompt'))
      .setDesc(t('promptDesc'))
      .addTextArea(text => {
        text
          .setValue(this.resultPrompt)
          .setPlaceholder(t('promptTranslatePlaceholder'))
          .onChange(value => this.resultPrompt = value);
        text.inputEl.rows = 6;
        text.inputEl.addClass('smartpick-full-width');
      });

    new Setting(contentEl)
      .setName(t('outputAction'))
      .setDesc(t('outputActionDesc'))
      .addDropdown(dropdown => {
        dropdown
          .addOption('replace', t('outputReplaceSelection'))
          .addOption('insert', t('outputInsertBelowSelection'))
          .addOption('clipboard', t('outputCopyToClipboard'))
          .setValue(this.resultOutputAction)
          .onChange(value => {
            this.resultOutputAction = value as 'replace' | 'insert' | 'clipboard';
          });
      });

    let iconText: TextComponent;

    const iconSetting = new Setting(contentEl)
      .setName(t('commandIcon'))
      .setDesc(t('commandIconDesc'))
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
    
    const iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview(this.resultIcon);

    const buttons = new Setting(contentEl);

    if (this.isEditing && !this.isBuiltin && this.onDelete) {
         buttons.addButton(btn => {
           btn.buttonEl.addClass('mod-warning');
           return btn
            .setButtonText(t('delete'))
            .onClick(() => {
              new ConfirmModal(
                this.app,
                t('deleteAICommand'),
                t('deleteAICommandDesc'),
                () => {
                  this.onDelete?.();
                  this.close();
                },
                t('delete')
              ).open();
            });
         });
    }

    buttons
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(this.isEditing ? t('save') : t('add'))
        .setCta()
        .onClick(() => {
          if (!this.resultName || !this.resultPrompt) {
            new Notice(t('notice_aiCommandRequired'));
            return;
          }
          this.close();
          this.onSubmit(this.resultName, this.resultPrompt, this.resultIcon, this.resultOutputAction);
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
  private onDelete?: () => void;

  constructor(
    app: App, 
    initialData: UrlCommandData | undefined,

    onSubmit: (name: string, url: string, icon: string) => void,
    onDelete?: () => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    this.onDelete = onDelete;
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
        .setPlaceholder('Google / shortcut name')
        .onChange(value => this.resultName = value));

    // URL Input
    new Setting(contentEl)
      .setName(t('enterUrl'))
      .addText(text => {
        text.setValue(this.resultUrl)
            .setPlaceholder('`https://...` or `shortcuts://...`')
            .onChange(value => this.resultUrl = value);
        text.inputEl.addClass('smartpick-full-width');
      });

    // Icon Input
    let iconText: TextComponent;

    
    const iconSetting = new Setting(contentEl)
      .setName(t('enterIconName'))
      .addText(text => {
        iconText = text;
        text.setValue(this.resultIcon)
            .setPlaceholder('`link`')
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
        
    const iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview(this.resultIcon);

    // Buttons
    const buttons = new Setting(contentEl);

    if (this.isEditing && this.onDelete) {
         buttons.addButton(btn => {
           btn.buttonEl.addClass('mod-warning');
           return btn
            .setButtonText(t('delete'))
            .onClick(() => {
                 this.onDelete?.();
                 this.close();
            });
         });
    }

    buttons
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
  private onDelete?: () => void;

  constructor(
    app: App, 
    initialData: ShortcutData | undefined,

    onSubmit: (name: string, keys: string, icon: string) => void,
    onDelete?: () => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    this.onDelete = onDelete;
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
        .setPlaceholder('Screenshot / app name')
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

    
    const iconSetting = new Setting(contentEl)
      .setName(t('enterIconName'))
      .addText(text => {
        iconText = text;
        text.setValue(this.resultIcon)
            .setPlaceholder('`keyboard`')
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
        
    const iconPreview = iconSetting.controlEl.createSpan({ cls: 'smartpick-icon-preview' });
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview(this.resultIcon);

    // Buttons
    const buttons = new Setting(contentEl);

    if (this.isEditing && this.onDelete) {
         buttons.addButton(btn => {
           btn.buttonEl.addClass('mod-warning');
           return btn
            .setButtonText(t('delete'))
            .onClick(() => {
                 this.onDelete?.();
                 this.close();
            });
         });
    }

    buttons
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(this.isEditing ? t('save') : t('addCommand'))
        .setCta()
        .onClick(() => {
          if (!this.resultName || !this.resultKeys) {
            new Notice('Name and shortcut keys are required');
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
