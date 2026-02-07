// Ollama Provider for local LLM

import { AIConfig } from '../../settings';
import { AIProvider, AIResponse, ChatMessage } from '../AIClient';
import { requestUrl } from 'obsidian';
import * as https from 'https';
import * as http from 'http';

export class OllamaProvider implements AIProvider {
  name = 'Ollama';

  async fetchModels(config: AIConfig): Promise<string[]> {
    const baseUrl = config.apiUrl.replace(/\/v1\/?$/, '');
    const url = `${baseUrl}/api/tags`;
    
    try {
      const response = await requestUrl({
        url,
        method: 'GET',
      });

      const data = response.json;
      
      if (data.models && Array.isArray(data.models)) {
        return data.models.map((model: { name: string }) => model.name).sort();
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch Ollama models:', error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[], config: AIConfig, model?: string): Promise<AIResponse> {
    const baseUrl = config.apiUrl.replace(/\/v1\/?$/, '');
    const url = `${baseUrl}/api/chat`;
    const useModel = model || config.defaultModel;

    try {
      const response = await requestUrl({
        url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: useModel,
          messages,
          stream: false,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens,
          },
        }),
      });

      const data = response.json;
      
      return {
        content: data.message?.content || '',
        finishReason: data.done_reason,
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
    const baseUrl = config.apiUrl.replace(/\/v1\/?$/, '');
    const urlObj = new URL(`${baseUrl}/api/chat`);
    const useModel = model || config.defaultModel;
    
    const isHttps = urlObj.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const req = requestModule.request(urlObj, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }, (res: http.IncomingMessage) => {
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
           let errorBody = '';
           res.on('data', (chunk: Buffer) => errorBody += chunk.toString());
           res.on('end', () => reject(new Error(`HTTP error! status: ${res.statusCode}, body: ${errorBody}`)));
           return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        res.on('data', (chunk: Buffer) => {
          const chunkText = decoder.decode(chunk, { stream: true });
          buffer += chunkText;
          
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  onChunk(parsed.message.content);
                }
              } catch {
                // Ignore JSON parse errors
              }
            }
          }
        });

        res.on('end', () => resolve());
        res.on('error', (err: Error) => reject(err));
      });

      req.on('error', (err: Error) => reject(err));

      req.write(JSON.stringify({
        model: useModel,
        messages,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
        },
        stream: true,
      }));
      
      req.end();
    });
  }
}
