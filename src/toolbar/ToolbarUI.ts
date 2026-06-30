// SmartPick Toolbar UI - DOM rendering and button handling

import { setIcon, setTooltip, MarkdownView, Platform } from 'obsidian';
import type SmartPickPlugin from '../main';
import type { Toolbar } from './Toolbar';
import type { ToolbarItem } from '../settings';
import { getBuiltinToolbarItemLabel, localize, t } from '../i18n';

const DESKTOP_VISIBLE_TOOLBAR_BUTTONS = 8;
const MOBILE_VISIBLE_TOOLBAR_BUTTONS = 5;

interface AppWithCommands {
  commands: {
    executeCommandById(id: string): void;
  };
}

interface AppWithSetting {
  setting?: {
    open(): void;
    openTabById(id: string): void;
  };
}

export class ToolbarUI {
  private plugin: SmartPickPlugin;
  private toolbar: Toolbar;
  private containerEl: HTMLElement | null = null;
  private toolbarEl: HTMLElement | null = null;
  private moreMenuEl: HTMLElement | null = null;
  private hasSelection: boolean = true;
  private currentPosition: { left: number; top: number; right: number; bottom: number; width: number } | null = null;
  private suppressToolbarClick: boolean = false;

  constructor(plugin: SmartPickPlugin, toolbar: Toolbar) {
    this.plugin = plugin;
    this.toolbar = toolbar;
  }

  show(pos: { left: number; top: number; right: number; bottom: number; width: number }, hasSelection: boolean = true): void {
    this.hide();
    this.hasSelection = hasSelection;
    this.currentPosition = pos;
    this.render(pos);
  }

  hide(): void {
    if (this.containerEl) {
      this.containerEl.remove();
      this.containerEl = null;
      this.toolbarEl = null;
      this.moreMenuEl = null;
    }
  }

  private render(pos: { left: number; top: number; right: number; bottom: number; width: number }): void {
    const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;

    // Remove any existing toolbars in this view to prevent duplicates
    const existingToolbars = view.contentEl.querySelectorAll('.smartpick-toolbar-container');
    existingToolbars.forEach((el: Element) => el.remove());

    // Create container
    this.containerEl = view.contentEl.createDiv();
    this.containerEl.className = 'smartpick-toolbar-container';
    this.containerEl.toggleClass('smartpick-toolbar-container-mobile', Platform.isMobile);
    
    // Vertical positioning: keep toolbar above selection, with a small mobile nudge down.
    let top = pos.top + this.plugin.settings.toolbarVerticalOffset;
    if (Platform.isMobile) {
        top += 12;
    }

    // Fix for "Select All" / off-screen selection start:
    // If the calculated top is above the viewport (negative or very small), clamp it to a minimum safe padding.
    // 10px padding from the top of the viewport seems reasonable.
    const minTop = 10;
    if (top < minTop) {
        top = minTop;
    }

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

    if (Platform.isMobile) {
        left = centerPoint;
        transform += ' translateX(-50%)';
    } else if (isMultiLine) {
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
    
    // Create toolbar
    this.toolbarEl = this.containerEl.createDiv();
    this.toolbarEl.className = 'smartpick-toolbar';
    this.toolbarEl.toggleClass('smartpick-toolbar-mobile', Platform.isMobile);

    const enabledItems = this.getSortedToolbarItems().filter(
      (item) => item.type !== 'separator' && item.enabled !== false
    );
    const maxVisibleItems = Platform.isMobile
      ? MOBILE_VISIBLE_TOOLBAR_BUTTONS
      : DESKTOP_VISIBLE_TOOLBAR_BUTTONS;
    const visibleItems = enabledItems.slice(0, maxVisibleItems);
    const overflowItems = enabledItems.slice(maxVisibleItems);

    for (const item of visibleItems) {
      this.renderButton(item, this.hasSelection);
    }

    if (overflowItems.length > 0 || enabledItems.length > 0) {
      this.renderMoreButton(overflowItems);
    }

    // Animate in
    const viewWindow = view.contentEl.ownerDocument.defaultView ?? activeWindow;
    viewWindow.requestAnimationFrame(() => {
      if (this.toolbarEl) {
        this.clampMobileToolbarPosition(view.contentEl);
        this.toolbarEl.classList.add('smartpick-toolbar-visible');
      }
    });
  }

  private clampMobileToolbarPosition(viewContentEl: HTMLElement): void {
    if (!Platform.isMobile || !this.containerEl || !this.toolbarEl) return;

    const padding = 8;
    const containerWidth = viewContentEl.getBoundingClientRect().width;
    const toolbarWidth = this.toolbarEl.getBoundingClientRect().width;
    const left = Number.parseFloat(this.containerEl.style.left || '0');

    if (toolbarWidth >= containerWidth - padding * 2) {
      this.containerEl.style.left = `${padding}px`;
      this.containerEl.style.transform = 'translateY(-100%)';
      return;
    }

    const minCenter = toolbarWidth / 2 + padding;
    const maxCenter = containerWidth - toolbarWidth / 2 - padding;
    const clampedLeft = Math.min(Math.max(left, minCenter), maxCenter);
    this.containerEl.style.left = `${clampedLeft}px`;
  }

  private renderButton(item: ToolbarItem, hasSelection: boolean = true): void {
    if (!this.toolbarEl) return;

    const button = this.toolbarEl.createEl('button');
    button.className = 'smartpick-toolbar-button';
    button.type = 'button';
    
    // Check if this button requires selection
    const needsSelection = item.type === 'ai' || item.type === 'url';
    if (needsSelection && !hasSelection) {
      button.classList.add('smartpick-toolbar-button-disabled');
    }
    
    const tooltip = item.isBuiltin
      ? getBuiltinToolbarItemLabel(item.id, item.tooltip)
      : item.tooltip;
    
    button.setAttribute('aria-label', tooltip);
    button.setAttribute('data-tooltip', tooltip);
    button.title = tooltip;
    setTooltip(button, tooltip, { placement: 'bottom', delay: 40 });

    // Set icon
    if (item.icon) {
      setIcon(button, item.icon);
    }

    // Add AI indicator
    if (item.type === 'ai') {
      button.classList.add('smartpick-toolbar-button-ai');
    }

    // Click handler
    button.setAttribute('data-smartpick-toolbar-item-id', item.id);
    if (!Platform.isMobile) {
      button.setAttribute('draggable', 'true');
      this.attachToolbarItemDragHandlers(button, item.id);
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.suppressToolbarClick) return;
      void this.handleButtonClick(item);
    });

    // (Already appended via createEl)
  }

  private renderMoreButton(items: ToolbarItem[]): void {
    if (!this.toolbarEl) return;

    const label = localize('更多', 'More');
    const button = this.toolbarEl.createEl('button');
    button.className = 'smartpick-toolbar-button smartpick-toolbar-more-button';
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-expanded', 'false');
    button.title = label;
    setTooltip(button, label, { placement: 'bottom', delay: 40 });
    setIcon(button, 'more-horizontal');

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.toggleMoreMenu(items, button);
    });
  }

  private toggleMoreMenu(items: ToolbarItem[], triggerButton: HTMLElement): void {
    if (!this.toolbarEl) return;

    if (this.moreMenuEl) {
      this.moreMenuEl.remove();
      this.moreMenuEl = null;
      triggerButton.classList.remove('is-open');
      triggerButton.setAttribute('aria-expanded', 'false');
      return;
    }

    triggerButton.classList.add('is-open');
    triggerButton.setAttribute('aria-expanded', 'true');
    this.moreMenuEl = this.toolbarEl.createDiv({ cls: 'smartpick-toolbar-more-menu' });

    for (const item of items) {
      this.renderMoreMenuItem(this.moreMenuEl, item);
    }

    this.renderSettingsMenuItem(this.moreMenuEl);
  }

  private renderMoreMenuItem(menuEl: HTMLElement, item: ToolbarItem): void {
    const button = menuEl.createEl('button', { cls: 'smartpick-toolbar-more-item' });
    button.type = 'button';

    const needsSelection = item.type === 'ai' || item.type === 'url';
    if (needsSelection && !this.hasSelection) {
      button.classList.add('smartpick-toolbar-more-item-disabled');
    }

    const iconEl = button.createSpan({ cls: 'smartpick-toolbar-more-item-icon' });
    if (item.icon) {
      setIcon(iconEl, item.icon);
    }

    const label = item.isBuiltin
      ? getBuiltinToolbarItemLabel(item.id, item.tooltip)
      : item.tooltip;
    button.createSpan({ cls: 'smartpick-toolbar-more-item-label', text: label });
    button.setAttribute('aria-label', label);

    if (item.type === 'ai') {
      button.classList.add('smartpick-toolbar-more-item-ai');
    }

    button.setAttribute('data-smartpick-toolbar-item-id', item.id);
    if (!Platform.isMobile) {
      button.setAttribute('draggable', 'true');
      this.attachToolbarItemDragHandlers(button, item.id);
    }

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.suppressToolbarClick) return;
      this.moreMenuEl?.remove();
      this.moreMenuEl = null;
      void this.handleButtonClick(item);
    });
  }

  private renderSettingsMenuItem(menuEl: HTMLElement): void {
    const label = t('openSmartPickSettings');
    const button = menuEl.createEl('button', {
      cls: 'smartpick-toolbar-more-item smartpick-toolbar-more-settings-item'
    });
    button.type = 'button';
    button.setAttribute('aria-label', label);

    const iconEl = button.createSpan({ cls: 'smartpick-toolbar-more-item-icon' });
    setIcon(iconEl, 'settings');
    button.createSpan({ cls: 'smartpick-toolbar-more-item-label', text: label });

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openPluginSettings();
    });
  }

  private openPluginSettings(): void {
    const appWithSetting = this.plugin.app as unknown as AppWithSetting;
    appWithSetting.setting?.open();
    appWithSetting.setting?.openTabById(this.plugin.manifest.id);
    this.toolbar.hide();
  }

  private getSortedToolbarItems(): ToolbarItem[] {
    return [...this.plugin.settings.toolbarItems].sort((a, b) => a.order - b.order);
  }

  private attachToolbarItemDragHandlers(element: HTMLElement, itemId: string): void {
    element.addEventListener('dragstart', (event) => {
      event.stopPropagation();
      this.suppressToolbarClick = true;
      element.classList.add('smartpick-toolbar-dragging');
      event.dataTransfer?.setData('text/plain', itemId);
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
      }
    });

    element.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      this.updateToolbarDropIndicator(element, event);
    });

    element.addEventListener('dragleave', () => {
      this.clearToolbarDropIndicator(element);
    });

    element.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.clearToolbarDropIndicator(element);

      const draggedId = event.dataTransfer?.getData('text/plain');
      if (!draggedId || draggedId === itemId) return;

      void this.moveToolbarItem(draggedId, itemId, event);
    });

    element.addEventListener('dragend', () => {
      element.classList.remove('smartpick-toolbar-dragging');
      this.clearAllToolbarDropIndicators();
      window.setTimeout(() => {
        this.suppressToolbarClick = false;
      }, 0);
    });
  }

  private updateToolbarDropIndicator(element: HTMLElement, event: DragEvent): void {
    this.clearToolbarDropIndicator(element);
    const rect = element.getBoundingClientRect();
    const isVerticalItem = element.classList.contains('smartpick-toolbar-more-item');
    const isAfter = isVerticalItem
      ? event.clientY > rect.top + rect.height / 2
      : event.clientX > rect.left + rect.width / 2;
    element.classList.add(isAfter ? 'smartpick-toolbar-drop-after' : 'smartpick-toolbar-drop-before');
  }

  private clearToolbarDropIndicator(element: HTMLElement): void {
    element.classList.remove('smartpick-toolbar-drop-before', 'smartpick-toolbar-drop-after');
  }

  private clearAllToolbarDropIndicators(): void {
    this.toolbarEl?.querySelectorAll('.smartpick-toolbar-drop-before, .smartpick-toolbar-drop-after').forEach((element) => {
      element.classList.remove('smartpick-toolbar-drop-before', 'smartpick-toolbar-drop-after');
    });
  }

  private async moveToolbarItem(draggedId: string, targetId: string, event: DragEvent): Promise<void> {
    const items = this.getSortedToolbarItems().filter((item) => item.type !== 'separator');
    const draggedIndex = items.findIndex((item) => item.id === draggedId);
    if (draggedIndex < 0) return;

    const [draggedItem] = items.splice(draggedIndex, 1);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (targetIndex < 0) return;

    const targetEl = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    const rect = targetEl?.getBoundingClientRect();
    const isVerticalItem = targetEl?.classList.contains('smartpick-toolbar-more-item') ?? false;
    const insertAfter = rect
      ? (isVerticalItem
        ? event.clientY > rect.top + rect.height / 2
        : event.clientX > rect.left + rect.width / 2)
      : false;
    items.splice(insertAfter ? targetIndex + 1 : targetIndex, 0, draggedItem);

    items.forEach((item, index) => {
      item.order = index;
    });

    await this.plugin.saveSettings();
    if (this.currentPosition) {
      this.render(this.currentPosition);
    }
  }



  private async handleButtonClick(item: ToolbarItem): Promise<void> {
    const selection = this.toolbar.getCurrentSelection();
    const editor = this.toolbar.getCurrentEditor();

    if (!editor) {
      return;
    }

    if (item.type === 'command' && item.commandId) {
      // Execute Obsidian command (works with or without selection)
      (this.plugin.app as unknown as AppWithCommands).commands.executeCommandById(item.commandId);
      this.toolbar.hide();
    } else if (item.type === 'ai') {
      // AI commands require selection
      if (!selection) return;
      await this.executeAICommand(item, selection);
    } else if (item.type === 'url' && item.url) {
      // URL commands require selection
      if (!selection) return;
      
      // Auto-copy to clipboard for easier pasting
      navigator.clipboard.writeText(selection).catch(err => {
        console.error('Failed to copy', err);
      });

      const url = item.url.replace(/{{selection}}/g, encodeURIComponent(selection));
      activeWindow.open(url);
      this.toolbar.hide();
    } else if (item.type === 'shortcut' && item.shortcutKeys) {
      // Shortcut commands work with or without selection
      this.plugin.commandManager?.executeShortcut(item.shortcutKeys);
      this.toolbar.hide();
    }
  }

  private async executeAICommand(item: ToolbarItem, selection: string): Promise<void> {
    // Import and show preview modal
    const { PreviewModal } = await import('../ui/PreviewModal');
    const modal = new PreviewModal(
      this.plugin.app,
      this.plugin,
      {
        id: item.id,
        name: item.tooltip,
        prompt: item.prompt || '',
        outputAction: item.outputAction || 'replace',
        isBuiltin: !!item.isBuiltin,
      },
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
