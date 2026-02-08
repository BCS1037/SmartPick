import { App, Modal, ButtonComponent } from 'obsidian';

export class ConfirmModal extends Modal {
  private title: string;
  private message: string;
  private onConfirm: () => void;
  private confirmLabel: string;

  constructor(
    app: App, 
    title: string, 
    message: string, 
    onConfirm: () => void,
    confirmLabel: string = 'Confirm'
  ) {
    super(app);
    this.title = title;
    this.message = message;
    this.onConfirm = onConfirm;
    this.confirmLabel = confirmLabel;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('smartpick-confirm-modal');

    contentEl.createEl('h2', { text: this.title });
    contentEl.createEl('p', { text: this.message });

    const buttonContainer = contentEl.createDiv('smartpick-confirm-buttons');

    new ButtonComponent(buttonContainer)
      .setButtonText('Cancel')
      .onClick(() => {
        this.close();
      });

    new ButtonComponent(buttonContainer)
      .setButtonText(this.confirmLabel)
      .setCta()
      .onClick(() => {
        this.onConfirm();
        this.close();
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}
