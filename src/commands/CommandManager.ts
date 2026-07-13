// SmartPick Command Manager - Manages custom commands and hotkeys

import type SmartPickPlugin from '../main';
import { Editor, Platform } from 'obsidian';
import { ToolbarItem } from '../settings';

interface RegisteredCommand {
  name: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getCommandsApi(app: unknown): Record<string, unknown> | null {
  if (!isRecord(app)) return null;
  const commands: unknown = Reflect.get(app, 'commands');
  return isRecord(commands) ? commands : null;
}

function getCommandRegistry(app: unknown): Record<string, unknown> | null {
  const commands = getCommandsApi(app);
  if (!commands) return null;
  const registry: unknown = Reflect.get(commands, 'commands');
  return isRecord(registry) ? registry : null;
}

function executeCommandById(app: unknown, id: string): void {
  const commands = getCommandsApi(app);
  if (!commands) return;
  const execute: unknown = Reflect.get(commands, 'executeCommandById');
  if (typeof execute === 'function') {
    Reflect.apply(execute, commands, [id]);
  }
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
              executeCommandById(this.plugin.app, item.commandId);
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
    const registry = getCommandRegistry(this.plugin.app);
    const commands: Array<{ id: string; name: string }> = [];
    if (!registry) return commands;

    for (const [id, command] of Object.entries(registry)) {
      if (isRegisteredCommand(command)) {
        commands.push({ id, name: command.name });
      }
    }

    return commands;
  }

  getCommandById(id: string): { id: string; name: string } | undefined {
    const registry = getCommandRegistry(this.plugin.app);
    const command = registry?.[id];
    if (isRegisteredCommand(command)) {
      return { id, name: command.name };
    }
    return undefined;
  }
}
