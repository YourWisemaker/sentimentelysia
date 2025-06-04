import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { sentimentRoutes } from './routes/sentiment';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'Sentiment Analysis API',
        version: '1.0.0',
        description: 'API for analyzing sentiment in text using LangChain and OpenRouter'
      },
      tags: [
        { name: 'sentiment', description: 'Sentiment analysis endpoints' }
      ]
    }
  }))
  .use(sentimentRoutes)
  .get('/', () => ({ message: 'Welcome to the Sentiment Analysis API' }))
  .listen(3001);

console.log(`🚀 Sentiment Analysis API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;