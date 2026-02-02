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
        text.inputEl.style.width = '100%';
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

export class AddCommandModal extends Modal {
  private resultId: string = '';
  private resultTooltip: string = '';
  private resultIcon: string = 'command';
  private onSubmit: (id: string, tooltip: string, icon: string) => void;

  constructor(app: App, onSubmit: (id: string, tooltip: string, icon: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: t('addCommand') });

    // Command Selection
    let commandIdText: TextComponent;
    let tooltipText: TextComponent;
    
    new Setting(contentEl)
      .setName(t('enterCommandId'))
      .addText(text => {
        commandIdText = text;
        text.setPlaceholder('editor:toggle-bold')
            .onChange(value => this.resultId = value);
      })
      .addButton(btn => btn
        .setButtonText(t('selectCommand'))
        .onClick(() => {
          new CommandSuggester(this.app, (command) => {
            this.resultId = command.id;
            this.resultTooltip = command.name;
            this.resultIcon = (command as any).icon || 'command'; // Some commands have icons
            
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
        text.onChange(value => this.resultTooltip = value);
      });

    // Icon Input
    let iconText: TextComponent;
    let iconPreview: HTMLElement;
    
    const iconSetting = new Setting(contentEl)
      .setName(t('enterIconName'))
      .addText(text => {
        iconText = text;
        text.setValue('command')
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
    iconPreview.style.marginLeft = '10px';
    iconPreview.style.display = 'flex';
    iconPreview.style.alignSelf = 'center';
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview('command');

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(t('addCommand'))
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

export class AddAICommandModal extends Modal {
  private selectedTemplateId: string = '';
  private resultIcon: string = 'sparkles';
  private templates: PromptTemplate[];
  private onSubmit: (templateId: string, icon: string) => void;

  constructor(app: App, templates: PromptTemplate[], onSubmit: (templateId: string, icon: string) => void) {
    super(app);
    this.templates = templates;
    this.onSubmit = onSubmit;
    if (templates.length > 0) {
      this.selectedTemplateId = templates[0].id;
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: t('addAICommand') });

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
        text.setValue('sparkles')
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
    iconPreview.style.marginLeft = '10px';
    iconPreview.style.display = 'flex';
    iconPreview.style.alignSelf = 'center';
    
    const updateIconPreview = (icon: string) => {
      iconPreview.empty();
      setIcon(iconPreview, icon);
    };
    updateIconPreview('sparkles');

    // Buttons
    new Setting(contentEl)
      .addButton(btn => btn
        .setButtonText(t('cancel'))
        .onClick(() => this.close()))
      .addButton(btn => btn
        .setButtonText(t('addAICommand'))
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
