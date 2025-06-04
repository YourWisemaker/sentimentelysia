// Custom implementation for OpenRouter integration with LangChain

import { ChatOpenAI } from '@langchain/openai';

/**
 * ChatOpenRouter is a custom implementation for OpenRouter integration with LangChain
 * It extends ChatOpenAI to use OpenRouter's API with Gemini Flash model
 */
export class ChatOpenRouter extends ChatOpenAI {
  constructor(config: {
    apiKey: string;
    model: string;
    temperature?: number;
  }) {
    super({
      openAIApiKey: config.apiKey,
      modelName: config.model,
      temperature: config.temperature ?? 0,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://sentimentelysia.app',
          'X-Title': 'SentimentElysia',
        },
      },
    });
  }
}