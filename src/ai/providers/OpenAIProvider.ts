// OpenAI Compatible Provider
// Supports OpenAI, SiliconFlow, and other OpenAI-compatible APIs

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

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI Compatible';

  async fetchModels(config: AIConfig): Promise<string[]> {
    try {
      const response = await requestUrl({
        url: `${config.apiUrl}/models`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      const data = requireJsonRecord(response.json as unknown, 'OpenAI model list');

      return getJsonArray(data, 'data')
        .filter(isJsonRecord)
        .map((model) => getJsonString(model, 'id'))
        .filter((id): id is string => id !== undefined)
        .filter((id) =>
          id.includes('gpt') ||
          id.includes('chat') ||
          id.includes('claude') ||
          id.includes('deepseek') ||
          id.includes('qwen') ||
          id.includes('glm') ||
          (!id.includes('embedding') && !id.includes('whisper') && !id.includes('tts') && !id.includes('dall-e'))
        )
        .sort();
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[], config: AIConfig, model?: string): Promise<AIResponse> {
    try {
      const response = await requestUrl({
        url: `${config.apiUrl}/chat/completions`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || config.defaultModel,
          messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stream: false,
        }),
      });
      const data = requireJsonRecord(response.json as unknown, 'OpenAI chat response');
      const firstChoice = getJsonArray(data, 'choices').find(isJsonRecord);
      const message = firstChoice ? getJsonRecord(firstChoice, 'message') : undefined;
      const content = message ? getJsonString(message, 'content') : undefined;

      if (content === undefined) {
        throw new Error('OpenAI chat response did not include message content');
      }

      return {
        content,
        finishReason: firstChoice ? getJsonString(firstChoice, 'finish_reason') : undefined,
      };
    } catch (error) {
      console.error('Chat request failed:', error);
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
      url: `${config.apiUrl}/chat/completions`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || config.defaultModel,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true,
      }),
    });

    for (const line of response.text.split(/\r?\n/)) {
      const data = line.trim();
      if (!data.startsWith('data: ')) continue;

      const payload = data.slice(6).trim();
      if (payload === '[DONE]') continue;

      const event = parseJsonRecord(payload);
      if (!event) continue;
      const firstChoice = getJsonArray(event, 'choices').find(isJsonRecord);
      const delta = firstChoice ? getJsonRecord(firstChoice, 'delta') : undefined;
      const content = delta ? getJsonString(delta, 'content') : undefined;
      if (content) onChunk(content);
    }
  }
}
