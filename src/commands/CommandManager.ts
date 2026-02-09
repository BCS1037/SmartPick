// SmartPick Command Manager - Manages custom commands and hotkeys

import type SmartPickPlugin from '../main';
import { exec } from 'child_process';
import { Editor, App } from 'obsidian';

interface AppWithCommands extends App {
  commands: {
    executeCommandById(id: string): void;
    commands: Record<string, { name: string }>;
  };
}

export class CommandManager {
  private plugin: SmartPickPlugin;

  constructor(plugin: SmartPickPlugin) {
    this.plugin = plugin;
  }

  init(): void {
    this.registerHotkeys();
  }

  registerHotkeys(): void {
    // Register commands for toolbar items with hotkeys
    for (const item of this.plugin.settings.toolbarItems) {
      if (item.hotkey && item.id) {
        this.plugin.addCommand({
          id: `smartpick-${item.id}`,
          name: `SmartPick: ${item.tooltip}`,
          editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (!selection) return;

            if (item.type === 'command' && item.commandId) {
              (this.plugin.app as AppWithCommands).commands.executeCommandById(item.commandId);
            } else if (item.type === 'ai' && item.promptTemplateId) {
              void this.executeAICommand(item.promptTemplateId, selection, editor);
            } else if (item.type === 'url' && item.url) {
              // Auto-copy to clipboard for easier pasting
              navigator.clipboard.writeText(selection).catch(err => {
                console.error('Failed to copy', err);
              });
              
              const url = item.url.replace(/{{selection}}/g, encodeURIComponent(selection));
              window.open(url);
            } else if (item.type === 'shortcut' && item.shortcutKeys) {
              this.executeShortcut(item.shortcutKeys);
            }
          },
        });
      }
    }
  }

  private async executeAICommand(
    templateId: string, 
    selection: string, 
    editor: Editor
  ): Promise<void> {
    const template = this.plugin.settings.promptTemplates.find(
      t => t.id === templateId
    );

    if (!template) {
      console.error('Template not found:', templateId);
      return;
    }

    const { PreviewModal } = await import('../ui/PreviewModal');
    const modal = new PreviewModal(
      this.plugin.app,
      this.plugin,
      template,
      selection,
      editor
    );
    modal.open();
  }

  public executeShortcut(keys: string): void {
    if (process.platform !== 'darwin') {
      console.warn('Shortcuts are only supported on macOS');
      return;
    }

    // Parse keys: "Cmd+Shift+S" -> keystroke "s" using {command down, shift down}
    const parts = keys.split('+');
    const key = parts.pop()?.toLowerCase();
    
    if (!key) return;

    const modifiers: string[] = [];
    parts.forEach(part => {
      const p = part.toLowerCase();
      if (p === 'cmd' || p === 'command' || p === 'meta') modifiers.push('command down');
      if (p === 'ctrl' || p === 'control') modifiers.push('control down');
      if (p === 'opt' || p === 'alt' || p === 'option') modifiers.push('option down');
      if (p === 'shift') modifiers.push('shift down');
    });

    const usingClause = modifiers.length > 0 ? ` using {${modifiers.join(', ')}}` : '';
    const script = `tell application "System Events" to keystroke "${key}"${usingClause}`;

    exec(`osascript -e '${script}'`, (error) => {
      if (error) {
        console.error('Failed to execute shortcut:', error);
      }
    });
  }

  getAllObsidianCommands(): Array<{ id: string; name: string }> {
    const app = this.plugin.app as AppWithCommands;
    return Object.entries(app.commands.commands).map(([id, cmd]) => ({
      id,
      name: cmd.name,
    }));
  }

  getCommandById(id: string): { id: string; name: string } | undefined {
    const cmd = (this.plugin.app as AppWithCommands).commands.commands[id];
    if (cmd) {
      return { id, name: cmd.name };
    }
    return undefined;
  }
}
