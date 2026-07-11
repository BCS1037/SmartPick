// SmartPick Command Manager - Manages custom commands and hotkeys

import type SmartPickPlugin from '../main';
import { Editor, Platform } from 'obsidian';
import { ToolbarItem } from '../settings';

interface AppWithCommands {
  commands: {
    executeCommandById(id: string): void;
    commands: Record<string, unknown>;
  };
}

interface RegisteredCommand {
  name: string;
}

function isRegisteredCommand(value: unknown): value is RegisteredCommand {
  return typeof value === 'object' && value !== null &&
    'name' in value && typeof value.name === 'string';
}

interface NodeRequireWindow extends Window {
  require?: (moduleName: string) => unknown;
}

interface ChildProcessModule {
  execFile(
    file: string,
    args: string[],
    callback: (error: Error | null) => void
  ): void;
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
          name: item.tooltip,
          editorCallback: (editor) => {
            const selection = editor.getSelection();
            if (!selection) return;

            if (item.type === 'command' && item.commandId) {
              (this.plugin.app as unknown as AppWithCommands).commands.executeCommandById(item.commandId);
            } else if (item.type === 'ai') {
              void this.executeAICommand(item, selection, editor);
            } else if (item.type === 'url' && item.url) {
              // Auto-copy to clipboard for easier pasting
              navigator.clipboard.writeText(selection).catch(err => {
                console.error('Failed to copy', err);
              });
              
              const url = item.url.replace(/{{selection}}/g, encodeURIComponent(selection));
              activeWindow.open(url);
            } else if (item.type === 'shortcut' && item.shortcutKeys) {
              this.executeShortcut(item.shortcutKeys);
            }
          },
        });
      }
    }
  }

  private async executeAICommand(
    item: ToolbarItem,
    selection: string, 
    editor: Editor
  ): Promise<void> {
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
      editor
    );
    modal.open();
  }

  public executeShortcut(keys: string): void {
    if (!Platform.isDesktopApp || !Platform.isMacOS) {
      console.warn('Shortcuts are only supported on macOS');
      return;
    }

    const req = (window as NodeRequireWindow).require;
    const childProcess = req?.('child_process') as ChildProcessModule | undefined;
    if (!childProcess?.execFile) {
      console.warn('Shortcuts are only supported in the Obsidian desktop app');
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
    childProcess.execFile('osascript', ['-e', script], (error) => {
      if (error) {
        console.error('Failed to execute shortcut:', error);
      }
    });
  }

  getAllObsidianCommands(): Array<{ id: string; name: string }> {
    const app = this.plugin.app as unknown as AppWithCommands;
    const commands: Array<{ id: string; name: string }> = [];

    for (const [id, command] of Object.entries(app.commands.commands)) {
      if (isRegisteredCommand(command)) {
        commands.push({ id, name: command.name });
      }
    }

    return commands;
  }

  getCommandById(id: string): { id: string; name: string } | undefined {
    const app = this.plugin.app as unknown as AppWithCommands;
    const command = app.commands.commands[id];
    if (isRegisteredCommand(command)) {
      return { id, name: command.name };
    }
    return undefined;
  }
}
