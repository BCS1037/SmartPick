// Ollama Provider for local LLM

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

export class OllamaProvider implements AIProvider {
  name = 'Ollama';

  async fetchModels(config: AIConfig): Promise<string[]> {
    try {
      const response = await requestUrl({
        url: `${config.apiUrl.replace(/\/v1\/?$/, '')}/api/tags`,
        method: 'GET',
      });
      const data = requireJsonRecord(response.json as unknown, 'Ollama model list');

      return getJsonArray(data, 'models')
        .filter(isJsonRecord)
        .map((model) => getJsonString(model, 'name'))
        .filter((name): name is string => name !== undefined)
        .sort();
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[], config: AIConfig, model?: string): Promise<AIResponse> {
    try {
      const response = await requestUrl({
        url: `${config.apiUrl.replace(/\/v1\/?$/, '')}/api/chat`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model || config.defaultModel,
          messages,
          stream: false,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens,
          },
        }),
      });
      const data = requireJsonRecord(response.json as unknown, 'Ollama chat response');
      const message = getJsonRecord(data, 'message');
      const content = message ? getJsonString(message, 'content') : undefined;

      if (content === undefined) {
        throw new Error('Ollama chat response did not include message content');
      }

      return {
        content,
        finishReason: getJsonString(data, 'done_reason'),
      };
    } catch (error) {
      console.error('Ollama chat request failed:', error);
      throw error;
    }
  }

  async chatStream(
    messages: ChatMessage[],
    config: AIConfig,
    onChunk: (chunk: string) => void,
    model?: string
  ): Promise<void> {
    const response = await requestUrl({
      url: `${config.apiUrl.replace(/\/v1\/?$/, '')}/api/chat`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || config.defaultModel,
        messages,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
        },
        stream: true,
      }),
    });

    for (const line of response.text.split(/\r?\n/)) {
      const event = parseJsonRecord(line.trim());
      if (!event) continue;

      const message = getJsonRecord(event, 'message');
      const content = message ? getJsonString(message, 'content') : undefined;
      if (content) onChunk(content);
    }
  }
}
