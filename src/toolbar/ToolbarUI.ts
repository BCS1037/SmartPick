// SmartPick Toolbar UI - DOM rendering and button handling

import { setIcon } from 'obsidian';
import type SmartPickPlugin from '../main';
import type { Toolbar } from './Toolbar';
import { ToolbarItem } from '../settings';
import { t } from '../i18n';

export class ToolbarUI {
  private plugin: SmartPickPlugin;
  private toolbar: Toolbar;
  private containerEl: HTMLElement | null = null;
  private toolbarEl: HTMLElement | null = null;

  constructor(plugin: SmartPickPlugin, toolbar: Toolbar) {
    this.plugin = plugin;
    this.toolbar = toolbar;
  }

  show(left: number, top: number, _selection: string): void {
    this.hide();
    this.render(left, top);
  }

  hide(): void {
    if (this.containerEl) {
      this.containerEl.remove();
      this.containerEl = null;
      this.toolbarEl = null;
    }
  }

  private render(left: number, top: number): void {
    // Get active markdown view
    const view = this.plugin.app.workspace.getActiveViewOfType(
      require('obsidian').MarkdownView
    );
    if (!view) return;

    // Remove any existing toolbars in this view to prevent duplicates
    const existingToolbars = (view as any).contentEl.querySelectorAll('.smartpick-toolbar-container');
    existingToolbars.forEach((el: Element) => el.remove());

    // Create container
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'smartpick-toolbar-container';
    this.containerEl.style.position = 'absolute';
    this.containerEl.style.left = `${Math.max(10, left)}px`;
    this.containerEl.style.top = `${Math.max(10, top)}px`;
    this.containerEl.style.zIndex = '1000';

    // Create toolbar
    this.toolbarEl = document.createElement('div');
    this.toolbarEl.className = 'smartpick-toolbar';

    // Sort items by group and order
    const items = [...this.plugin.settings.toolbarItems].sort((a, b) => {
      if (a.group !== b.group) {
        const groupA = this.plugin.settings.commandGroups.find(g => g.id === a.group);
        const groupB = this.plugin.settings.commandGroups.find(g => g.id === b.group);
        return (groupA?.order || 0) - (groupB?.order || 0);
      }
      return a.order - b.order;
    });

    // Render items
    for (const item of items) {
      if (item.type === 'separator') {
        this.renderSeparator();
      } else {
        this.renderButton(item);
      }
    }

    this.containerEl.appendChild(this.toolbarEl);
    (view as any).contentEl.appendChild(this.containerEl);

    // Animate in
    requestAnimationFrame(() => {
      if (this.toolbarEl) {
        this.toolbarEl.classList.add('smartpick-toolbar-visible');
      }
    });
  }

  private renderButton(item: ToolbarItem): void {
    if (!this.toolbarEl) return;

    const button = document.createElement('button');
    button.className = 'smartpick-toolbar-button';
    button.setAttribute('aria-label', item.tooltip);
    button.title = item.tooltip;

    // Set icon
    if (item.icon) {
      setIcon(button, item.icon);
    }

    // Add AI indicator
    if (item.type === 'ai') {
      button.classList.add('smartpick-toolbar-button-ai');
    }

    // Click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleButtonClick(item);
    });

    this.toolbarEl.appendChild(button);
  }

  private renderSeparator(): void {
    if (!this.toolbarEl) return;

    const separator = document.createElement('div');
    separator.className = 'smartpick-toolbar-separator';
    this.toolbarEl.appendChild(separator);
  }

  private async handleButtonClick(item: ToolbarItem): Promise<void> {
    const selection = this.toolbar.getCurrentSelection();
    const editor = this.toolbar.getCurrentEditor();

    if (!selection || !editor) {
      return;
    }

    if (item.type === 'command' && item.commandId) {
      // Execute Obsidian command
      (this.plugin.app as any).commands.executeCommandById(item.commandId);
      this.toolbar.hide();
    } else if (item.type === 'ai' && item.promptTemplateId) {
      // Execute AI command
      await this.executeAICommand(item.promptTemplateId, selection);
    }
  }

  private async executeAICommand(templateId: string, selection: string): Promise<void> {
    console.log('SmartPick Debug - ToolbarUI.executeAICommand:', {
      templateId,
      selectionLength: selection?.length,
      selectionPreview: selection?.substring(0, 20)
    });

    const template = this.plugin.settings.promptTemplates.find(
      t => t.id === templateId
    );

    if (!template) {
      console.error('Template not found:', templateId);
      return;
    }

    // Import and show preview modal
    const { PreviewModal } = await import('../ui/PreviewModal');
    const modal = new PreviewModal(
      this.plugin.app,
      this.plugin,
      template,
      selection,
      this.toolbar.getCurrentEditor()
    );
    modal.open();
    this.toolbar.hide();
  }

  destroy(): void {
    this.hide();
  }
}
