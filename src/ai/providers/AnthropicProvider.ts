// Anthropic Provider for Claude API

import { AIConfig } from '../../settings';
import { AIProvider, AIResponse, ChatMessage } from '../AIClient';
import { requestUrl } from 'obsidian';
import * as https from 'https';
import * as http from 'http';

export class AnthropicProvider implements AIProvider {
  name = 'Anthropic';

  fetchModels(_config: AIConfig): Promise<string[]> {
    // Anthropic doesn't have a models endpoint, return hardcoded list
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
    messages: Array<{ role: 'user' | 'assistant'; content: string }> 
  } {
    const systemMessages = messages.filter(m => m.role === 'system');
    const otherMessages = messages.filter(m => m.role !== 'system');
    
    return {
      system: systemMessages.map(m => m.content).join('\n'),
      messages: otherMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    };
  }

  async chat(messages: ChatMessage[], config: AIConfig, model?: string): Promise<AIResponse> {
    const url = `${config.apiUrl}/messages`;
    const useModel = model || config.defaultModel || 'claude-3-5-sonnet-20241022';
    const { system, messages: anthropicMessages } = this.convertMessages(messages);

    try {
      const response = await requestUrl({
        url,
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: useModel,
          max_tokens: config.maxTokens,
          system,
          messages: anthropicMessages,
        }),
      });

      const data = response.json;
      const content = data.content
        .filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('');

      return {
        content,
        finishReason: data.stop_reason,
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
    const useModel = model || config.defaultModel || 'claude-3-5-sonnet-20241022';
    const { system, messages: anthropicMessages } = this.convertMessages(messages);

    const urlObj = new URL(`${config.apiUrl}/messages`);
    const isHttps = urlObj.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    return new Promise((resolve, reject) => {
      const req = requestModule.request(urlObj, {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
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
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                  onChunk(parsed.delta.text);
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
        max_tokens: config.maxTokens,
        system,
        messages: anthropicMessages,
        stream: true,
      }));
      
      req.end();
    });
  }
}
