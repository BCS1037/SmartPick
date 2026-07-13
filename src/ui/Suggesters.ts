import { App, FuzzySuggestModal, setIcon } from 'obsidian';
import { getIconIds, FuzzyMatch } from 'obsidian';

interface CommandItem {
  id: string;
  name: string;
  icon?: string;
}

function isCommandItem(value: unknown): value is CommandItem {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    (!('icon' in value) || value.icon === undefined || typeof value.icon === 'string');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getCommandRegistry(app: unknown): Record<string, unknown> {
  if (!isRecord(app)) return {};
  const commands: unknown = Reflect.get(app, 'commands');
  if (!isRecord(commands)) return {};
  const registry: unknown = Reflect.get(commands, 'commands');
  return isRecord(registry) ? registry : {};
}

export class CommandSuggester extends FuzzySuggestModal<CommandItem> {
  private onChoose: (command: CommandItem) => void;

  constructor(app: App, onChoose: (command: CommandItem) => void) {
    super(app);
    this.onChoose = onChoose;
    this.setPlaceholder('Search commands...');
  }

  getItems(): CommandItem[] {
    return Object.values(getCommandRegistry(this.app)).filter(isCommandItem);
  }

  getItemText(item: CommandItem): string {
    return item.name;
  }

  onChooseItem(item: CommandItem): void {
    this.onChoose(item);
  }
}

export class IconSuggester extends FuzzySuggestModal<string> {
  private onChoose: (icon: string) => void;

  constructor(app: App, onChoose: (icon: string) => void) {
    super(app);
    this.onChoose = onChoose;
    this.setPlaceholder('Search icons...');
  }

  getItems(): string[] {
    return getIconIds();
  }

  getItemText(item: string): string {
    return item;
  }

  renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement) {
    el.addClass('smartpick-icon-suggestion');
    const iconEl = el.createSpan('smartpick-suggestion-icon');
    setIcon(iconEl, item.item);
    el.createSpan({ text: item.item });
  }

  onChooseItem(item: string): void {
    this.onChoose(item);
  }
}
