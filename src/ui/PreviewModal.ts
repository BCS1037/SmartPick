// SmartPick Preview Modal - AI response preview with streaming

import { App, Editor, Modal, MarkdownRenderer, Component, setIcon, setTooltip } from 'obsidian';
import type SmartPickPlugin from '../main';
import { PromptTemplate, AIProvider as AIProviderType } from '../settings';
import { 
  AIProvider, 
  ChatMessage, 
  parsePromptTemplate,
  addToHistory,
  getConversationHistory,
  trimHistory 
} from '../ai/AIClient';
import { OpenAIProvider } from '../ai/providers/OpenAIProvider';
import { AnthropicProvider } from '../ai/providers/AnthropicProvider';
import { OllamaProvider } from '../ai/providers/OllamaProvider';
import { t } from '../i18n';

export class PreviewModal extends Modal {
  private plugin: SmartPickPlugin;
  private template: PromptTemplate;
  private selectedText: string;
  private editor: Editor | null;
  private responseEl: HTMLElement | null = null;
  private response: string = '';
  private isGenerating: boolean = false;

  constructor(
    app: App,
    plugin: SmartPickPlugin,
    template: PromptTemplate,
    selection: string,
    editor: Editor | null
  ) {
    super(app);
    this.plugin = plugin;
    this.template = template;
    this.selectedText = selection;
    this.editor = editor;

    console.log('SmartPick Debug - PreviewModal constructor:', {
      selectionArg: selection,
      typeofSelection: typeof selection,
      templateName: template.name
    });
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('smartpick-preview-modal');

    // Title
    const titleEl = contentEl.createEl('h2', { text: t('previewTitle') });
    titleEl.addClass('smartpick-preview-title');

    // Template name
    contentEl.createEl('div', { 
      text: this.template.name,
      cls: 'smartpick-preview-template-name'
    });

    // Response container
    this.responseEl = contentEl.createDiv('smartpick-preview-content');
    this.responseEl.setText(t('generating'));

    // Buttons container
    const buttonsEl = contentEl.createDiv('smartpick-preview-buttons');

    // Replace button
    const replaceBtn = buttonsEl.createEl('button');
    setIcon(replaceBtn, 'replace');
    setTooltip(replaceBtn, t('replace'));
    replaceBtn.addEventListener('click', () => this.handleReplace());

    // Insert button
    const insertBtn = buttonsEl.createEl('button');
    setIcon(insertBtn, 'arrow-down-to-line');
    setTooltip(insertBtn, t('insert'));
    insertBtn.addEventListener('click', () => this.handleInsert());

    // Copy button
    const copyBtn = buttonsEl.createEl('button');
    setIcon(copyBtn, 'copy');
    setTooltip(copyBtn, t('copy'));
    copyBtn.addEventListener('click', () => this.handleCopy());

    // Cancel button
    const cancelBtn = buttonsEl.createEl('button');
    setIcon(cancelBtn, 'x');
    setTooltip(cancelBtn, t('cancel'));
    cancelBtn.addEventListener('click', () => this.close());

    // Start generation
    this.generate();
  }

  private async generate(): Promise<void> {
    this.isGenerating = true;
    this.response = '';

    try {
      const provider = this.getProvider();
      const { aiConfig } = this.plugin.settings;

      if (!aiConfig.apiKey && aiConfig.provider !== 'ollama') {
        this.showError(t('apiKeyRequired'));
        return;
      }

      if (!aiConfig.defaultModel) {
        this.showError(t('modelRequired'));
        return;
      }

      // Get active note title for context
      const activeFile = this.app.workspace.getActiveFile();
      const noteTitle = activeFile?.basename || '';

      // Parse prompt template
      const prompt = parsePromptTemplate(this.template, this.selectedText, {
        title: noteTitle,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      });

      // Build messages
      const messages: ChatMessage[] = [];

      // Add history for multi-turn
      if (this.plugin.settings.enableMultiTurn) {
        const history = getConversationHistory();
        messages.push(...history);
      }

      // Add user message
      messages.push({ role: 'user', content: prompt });

      // Stream response
      console.log('SmartPick Debug - Calling chatStream...');
      
      let lastRender = 0;
      let isRendering = false;
      const RENDER_INTERVAL = 100; // ms

      await provider.chatStream(
        messages,
        aiConfig,
        async (chunk) => {
          this.response += chunk;
          
          const now = Date.now();
          if (!this.isGenerating) return; // Stop if cancelled

            if (!isRendering && now - lastRender >= RENDER_INTERVAL && this.responseEl) {
            isRendering = true;
            lastRender = now;
            
            try {
              // Render partial response
              console.log('SmartPick Debug - Starting partial render. Length:', this.response.length);
              this.responseEl.empty();
              await MarkdownRenderer.render(
                this.app,
                this.response,
                this.responseEl,
                '',
                this.plugin
              );
              console.log('SmartPick Debug - Partial render success');
              
              // Scroll to bottom
              this.responseEl.scrollTop = this.responseEl.scrollHeight;
            } catch (e) {
              console.debug('SmartPick - Partial render skipped:', e);
            } finally {
              isRendering = false;
            }
          }
        },
        this.template.model || aiConfig.defaultModel
      );
      console.log('SmartPick Debug - chatStream returned. Response length:', this.response.length);

      // Render Markdown after streaming completes
      if (this.responseEl) {
        console.log('SmartPick Debug - Starting Markdown rendering...');
        try {
          this.responseEl.empty();
          await MarkdownRenderer.render(
            this.app,
            this.response,
            this.responseEl,
            '',
            this.plugin
          );
          console.log('SmartPick Debug - Markdown rendering complete');
        } catch (renderError) {
          console.error('SmartPick Debug - Markdown rendering failed:', renderError);
          // Fallback to text if rendering fails
          this.responseEl.setText(this.response);
        }
      }

      // Add to history for multi-turn
      if (this.plugin.settings.enableMultiTurn) {
        addToHistory({ role: 'user', content: prompt });
        addToHistory({ role: 'assistant', content: this.response });
        trimHistory(this.plugin.settings.maxHistoryTurns);
      }

    } catch (error) {
      console.error('Generation failed:', error);
      this.showError(`${t('error')}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isGenerating = false;
    }
  }

  private getProvider(): AIProvider {
    const providerType = this.plugin.settings.aiConfig.provider;
    
    switch (providerType) {
      case 'anthropic':
        return new AnthropicProvider();
      case 'ollama':
        return new OllamaProvider();
      case 'openai':
      case 'custom':
      default:
        return new OpenAIProvider();
    }
  }

  private showError(message: string): void {
    if (this.responseEl) {
      this.responseEl.setText(message);
      this.responseEl.addClass('smartpick-preview-error');
    }
  }

  private handleReplace(): void {
    if (!this.response || !this.editor) return;
    
    const from = this.editor.getCursor('from');
    const to = this.editor.getCursor('to');
    this.editor.replaceRange(this.response, from, to);
    this.close();
  }

  private handleInsert(): void {
    if (!this.response || !this.editor) return;
    
    const to = this.editor.getCursor('to');
    this.editor.replaceRange('\n\n' + this.response, to);
    this.close();
  }

  private async handleCopy(): Promise<void> {
    if (!this.response) return;
    
    await navigator.clipboard.writeText(this.response);
    this.close();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
