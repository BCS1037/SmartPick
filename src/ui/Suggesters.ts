import { App, FuzzySuggestModal, Command, setIcon } from 'obsidian';
import { getIconIds } from 'obsidian';

export class CommandSuggester extends FuzzySuggestModal<Command> {
  private onChoose: (command: Command) => void;

  constructor(app: App, onChoose: (command: Command) => void) {
    super(app);
    this.onChoose = onChoose;
    this.setPlaceholder('Search commands...');
  }

  getItems(): Command[] {
    return Object.values((this.app as any).commands.commands);
  }

  getItemText(item: Command): string {
    return item.name;
  }

  onChooseItem(item: Command, evt: MouseEvent | KeyboardEvent): void {
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

  renderSuggestion(item: { item: string, match: any }, el: HTMLElement) {
    el.addClass('smartpick-icon-suggestion');
    const iconEl = el.createSpan('smartpick-suggestion-icon');
    setIcon(iconEl, item.item);
    el.createSpan({ text: item.item });
  }

  onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
    this.onChoose(item);
  }
}
