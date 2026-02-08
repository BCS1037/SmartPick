// OpenAI Compatible Provider
// Supports OpenAI, SiliconFlow, and other OpenAI-compatible APIs

import { AIConfig } from '../../settings';
import { AIProvider, AIResponse, ChatMessage } from '../AIClient';
import { requestUrl } from 'obsidian';
import * as https from 'https';
import * as http from 'http';

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI Compatible';

  async fetchModels(config: AIConfig): Promise<string[]> {
    const url = `${config.apiUrl}/models`;
    
    try {
      const response = await requestUrl({
        url,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.json;
      
      if (data.data && Array.isArray(data.data)) {
        return data.data
          .map((model: { id: string }) => model.id)
          .filter((id: string) => 
            // Filter chat models (heuristic)
            id.includes('gpt') || 
            id.includes('chat') || 
            id.includes('claude') ||
            id.includes('deepseek') ||
            id.includes('qwen') ||
            id.includes('glm') ||
            !id.includes('embedding') &&
            !id.includes('whisper') &&
            !id.includes('tts') &&
            !id.includes('dall-e')
          )
          .sort();
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[], config: AIConfig, model?: string): Promise<AIResponse> {
    const url = `${config.apiUrl}/chat/completions`;
    const useModel = model || config.defaultModel;

    try {
      const response = await requestUrl({
        url,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: useModel,
          messages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stream: false,
        }),
      });

      const data = response.json;
      
      return {
        content: data.choices[0].message.content,
        finishReason: data.choices[0].finish_reason,
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
    const useModel = model || config.defaultModel;
    
    // Parse URL to decide between http and https
    const urlObj = new URL(`${config.apiUrl}/chat/completions`);
    const isHttps = urlObj.protocol === 'https:';
    const requestModule = isHttps ? https : http;
    
    return new Promise((resolve, reject) => {
      // console.debug('Start request to:', urlObj.toString());
      
      const req = requestModule.request(urlObj, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
      }, (res: http.IncomingMessage) => {
        // console.debug('Response received:', res.statusCode);
        
        if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
           // Read error body
           let errorBody = '';
           res.on('data', (chunk: Buffer) => errorBody += chunk.toString());
           res.on('end', () => {
             const errorMsg = `HTTP error! status: ${res.statusCode}, body: ${errorBody}`;
             console.error('SmartPick Debug - ' + errorMsg);
             reject(new Error(errorMsg));
           });
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
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch {
                // Ignore JSON parse errors
              }
            }
          }
        });

        res.on('end', () => {
          resolve();
        });
        
        res.on('error', (err: Error) => {
          reject(err);
        });
      });

      req.on('error', (err: Error) => {
        reject(err);
      });

      req.write(JSON.stringify({
        model: useModel,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true,
      }));
      
      req.end();
    });
  }
}
