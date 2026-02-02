// SmartPick Command Manager - Manages custom commands and hotkeys

import type SmartPickPlugin from '../main';
import { ToolbarItem } from '../settings';

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
              (this.plugin.app as any).commands.executeCommandById(item.commandId);
            } else if (item.type === 'ai' && item.promptTemplateId) {
              this.executeAICommand(item.promptTemplateId, selection, editor);
            }
          },
        });
      }
    }
  }

  private async executeAICommand(
    templateId: string, 
    selection: string, 
    editor: any
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

  getAllObsidianCommands(): Array<{ id: string; name: string }> {
    return Object.entries((this.plugin.app as any).commands.commands).map(([id, cmd]: [string, any]) => ({
      id,
      name: cmd.name,
    }));
  }

  getCommandById(id: string): { id: string; name: string } | undefined {
    const cmd = (this.plugin.app as any).commands.commands[id];
    if (cmd) {
      return { id, name: cmd.name };
    }
    return undefined;
  }
}
