// SmartPick AI Client - Unified AI API interface

import { AIConfig, PromptTemplate } from '../settings';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  finishReason?: string;
}

export interface AIProvider {
  name: string;
  fetchModels(config: AIConfig): Promise<string[]>;
  chat(messages: ChatMessage[], config: AIConfig, model?: string): Promise<AIResponse>;
  chatStream(
    messages: ChatMessage[],
    config: AIConfig,
    onChunk: (chunk: string) => void,
    model?: string
  ): Promise<void>;
}

// Conversation history for multi-turn chat
let conversationHistory: ChatMessage[] = [];

export function clearConversationHistory(): void {
  conversationHistory = [];
}

export function getConversationHistory(): ChatMessage[] {
  return [...conversationHistory];
}

export function addToHistory(message: ChatMessage): void {
  conversationHistory.push(message);
}

export function trimHistory(maxTurns: number): void {
  // Keep system message + last N user/assistant pairs
  if (conversationHistory.length <= 1) return;
  
  const systemMessages = conversationHistory.filter(m => m.role === 'system');
  const otherMessages = conversationHistory.filter(m => m.role !== 'system');
  
  const maxMessages = maxTurns * 2;
  if (otherMessages.length > maxMessages) {
    conversationHistory = [
      ...systemMessages,
      ...otherMessages.slice(-maxMessages)
    ];
  }
}

// Parse template variables
export function parsePromptTemplate(
  template: PromptTemplate,
  selection: string,
  context: {
    title?: string;
    date?: string;
    time?: string;
  }
): string {
  let prompt = template.prompt;

  // Ensure selection is a string
  if (typeof selection !== 'string') {
    console.warn('SmartPick: selection is not a string:', selection);
    selection = String(selection || '');
  }
  


  prompt = prompt.replace(/\{\{selection\}\}/g, selection);
  prompt = prompt.replace(/\{\{title\}\}/g, context.title || '');
  prompt = prompt.replace(/\{\{date\}\}/g, context.date || new Date().toLocaleDateString());
  prompt = prompt.replace(/\{\{time\}\}/g, context.time || new Date().toLocaleTimeString());
  
  return prompt;
}
