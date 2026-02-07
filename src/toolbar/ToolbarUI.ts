// SmartPick Toolbar UI - DOM rendering and button handling

import { setIcon, MarkdownView, Notice } from 'obsidian';
import type SmartPickPlugin from '../main';
import type { Toolbar } from './Toolbar';
import { ToolbarItem } from '../settings';
import { t, I18nStrings } from '../i18n';


interface AppWithCommands {
  commands: {
    executeCommandById(id: string): void;
  };
}

export class ToolbarUI {
  private plugin: SmartPickPlugin;
  private toolbar: Toolbar;
  private containerEl: HTMLElement | null = null;
  private toolbarEl: HTMLElement | null = null;

  constructor(plugin: SmartPickPlugin, toolbar: Toolbar) {
    this.plugin = plugin;
    this.toolbar = toolbar;
  }

  show(pos: { left: number; top: number; right: number; bottom: number; width: number }): void {
    this.hide();
    this.render(pos);
  }

  hide(): void {
    if (this.containerEl) {
      this.containerEl.remove();
      this.containerEl = null;
      this.toolbarEl = null;
    }
  }

  private render(pos: { left: number; top: number; right: number; bottom: number; width: number }): void {
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    // Remove any existing toolbars in this view to prevent duplicates
    const existingToolbars = view.contentEl.querySelectorAll('.smartpick-toolbar-container');
    existingToolbars.forEach((el: Element) => el.remove());

    // Create container
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'smartpick-toolbar-container';
    
    // Vertical positioning: Always above the selection with 0 offset (standard)
    // We assume the toolbar height is about 40px, plus some padding (e.g. 10px) = 50px
    // But since we want "standard 0 offset" from the top of the selection line, we position it at pos.top
    // and rely on CSS transform: translateY(-100%) and some margin-bottom in CSS/JS to lift it up.
    // Let's set it to pos.top + user setting (default 26px)
    const top = pos.top + this.plugin.settings.toolbarVerticalOffset;
    this.containerEl.style.top = `${top}px`;

    // Horizontal positioning logic
    let left = 0;
    let transform = 'translateY(-100%)'; // Base transform for vertical alignment

    // Check if multi-line (simple heuristic: difference in top/bottom is large enough)
    const lineHeight = 20; // Approx
    const isMultiLine = (pos.bottom - pos.top) > lineHeight * 1.5;
    
    const containerWidth = pos.width;
    const centerPoint = (pos.left + pos.right) / 2;
    const centerPercent = centerPoint / containerWidth;

    if (isMultiLine) {
        // Center align relative to the editor width
        left = containerWidth / 2;
        transform += ' translateX(-50%)';
    } else {
        if (centerPercent < 0.4) {
            // Left align with selection start
            left = pos.left;
            // No horizontal translate needed
        } else if (centerPercent > 0.6) {
            // Right align with selection end
            left = pos.right;
            transform += ' translateX(-100%)';
        } else {
            // Center align with selection center
            left = centerPoint;
            transform += ' translateX(-50%)';
        }
    }

    this.containerEl.style.left = `${left}px`;
    this.containerEl.style.transform = transform;
    
    // Ensure it doesn't overflow screen edges (basic clamping)
    // Note: Since we use transforms, simple clamping on 'left' isn't perfect but helps.
    // A more robust solution involves measuring toolbar width after render, but that causes flickering.
    // For now, we trust the alignment logic to keep it generally safe, 
    // and maybe add max-width/overflow handling in CSS.

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
      if (item.type !== 'separator') {
        this.renderButton(item);
      }
    }

    this.containerEl.appendChild(this.toolbarEl);
    view.contentEl.appendChild(this.containerEl);

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
    
    let tooltip = item.tooltip;
    if (['bold', 'italic', 'highlight'].includes(item.id)) {
      tooltip = t(('command_' + item.id) as keyof I18nStrings);
    } else if (['ai-translate', 'ai-summarize', 'ai-explain'].includes(item.id)) {
      tooltip = t(('command_' + item.id.replace('-', '_')) as keyof I18nStrings);
    }
    
    button.setAttribute('aria-label', tooltip);
    button.title = tooltip;

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
      void this.handleButtonClick(item);
    });

    this.toolbarEl.appendChild(button);
  }



  private async handleButtonClick(item: ToolbarItem): Promise<void> {
    const selection = this.toolbar.getCurrentSelection();
    const editor = this.toolbar.getCurrentEditor();

    if (!selection || !editor) {
      return;
    }

    if (item.type === 'command' && item.commandId) {
      // Execute Obsidian command
      (this.plugin.app as unknown as AppWithCommands).commands.executeCommandById(item.commandId);
      this.toolbar.hide();
    } else if (item.type === 'ai' && item.promptTemplateId) {

      // Execute AI command
      // Handle toolbar hide inside executeAICommand or here? Original code didn't hide here, but executeAICommand had this.toolbar.hide() call at the end.
      await this.executeAICommand(item.promptTemplateId, selection);
    } else if (item.type === 'url' && item.url) {
      // Execute URL command
      
      // Auto-copy to clipboard for easier pasting
      navigator.clipboard.writeText(selection).catch(err => {
        console.error('Failed to copy', err);
      });

      const url = item.url.replace(/{{selection}}/g, encodeURIComponent(selection));
      window.open(url);
      this.toolbar.hide();
    } else if (item.type === 'shortcut' && item.shortcutKeys) {
      // Execute Shortcut
      this.plugin.commandManager?.executeShortcut(item.shortcutKeys);
      this.toolbar.hide();
    }
  }

  private async executeAICommand(templateId: string, selection: string): Promise<void> {


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
