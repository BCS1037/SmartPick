// Anthropic Provider for Claude API

import { requestUrl } from 'obsidian';
import type { AIConfig } from '../../settings';
import type { AIProvider, AIResponse, ChatMessage } from '../AIClient';
import {
  getJsonArray,
  getJsonRecord,
  getJsonString,
  isJsonRecord,
  parseJsonRecord,
  requireJsonRecord,
} from '../json';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';

  fetchModels(): Promise<string[]> {
    return Promise.resolve([
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ]);
  }

  private convertMessages(messages: ChatMessage[]): {
    system: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  } {
    const systemMessages = messages.filter((message) => message.role === 'system');
    const otherMessages = messages.filter(
      (message): message is ChatMessage & { role: 'user' | 'assistant' } => message.role !== 'system'
    );

    return {
      system: systemMessages.map((message) => message.content).join('\n'),
      messages: otherMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    };
  }

  async chat(messages: ChatMessage[], config: AIConfig, model?: string): Promise<AIResponse> {
    const { system, messages: anthropicMessages } = this.convertMessages(messages);

    try {
      const response = await requestUrl({
        url: `${config.apiUrl}/messages`,
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || config.defaultModel || 'claude-3-5-sonnet-20241022',
          max_tokens: config.maxTokens,
          system,
          messages: anthropicMessages,
        }),
      });
      const data = requireJsonRecord(response.json as unknown, 'Anthropic chat response');
      const content = getJsonArray(data, 'content')
        .filter(isJsonRecord)
        .filter((block) => getJsonString(block, 'type') === 'text')
        .map((block) => getJsonString(block, 'text'))
        .filter((text): text is string => text !== undefined)
        .join('');

      return {
        content,
        finishReason: getJsonString(data, 'stop_reason'),
      };
    } catch (error) {
      console.error('Anthropic chat request failed:', error);
      throw error;
    }
  }

  async chatStream(
    messages: ChatMessage[],
    config: AIConfig,
    onChunk: (chunk: string) => void,
    model?: string
  ): Promise<void> {
    const { system, messages: anthropicMessages } = this.convertMessages(messages);
    const response = await requestUrl({
      url: `${config.apiUrl}/messages`,
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || config.defaultModel || 'claude-3-5-sonnet-20241022',
        max_tokens: config.maxTokens,
        system,
        messages: anthropicMessages,
        stream: true,
      }),
    });

    for (const line of response.text.split(/\r?\n/)) {
      const data = line.trim();
      if (!data.startsWith('data: ')) continue;

      const event = parseJsonRecord(data.slice(6).trim());
      if (!event || getJsonString(event, 'type') !== 'content_block_delta') continue;

      const delta = getJsonRecord(event, 'delta');
      const text = delta ? getJsonString(delta, 'text') : undefined;
      if (text) onChunk(text);
    }
  }
}
