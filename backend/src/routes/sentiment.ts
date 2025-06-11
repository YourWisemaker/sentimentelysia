import { Elysia, t } from 'elysia';
import { analyzeSentiment } from '@/services/sentiment-service';
import { processCsvFile } from '@/services/csv-sentiment-service';
import { processFile } from '../services/file-service';

export const sentimentRoutes = new Elysia({ prefix: '/api' })
  .post('/analyze', 
    async ({ body }) => {
      try {
        const result = await analyzeSentiment(body.text);
        return result;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to analyze sentiment' };
      }
    },
    {
      body: t.Object({
        text: t.String()
      }),
      detail: {
        summary: 'Analyze sentiment of text',
        tags: ['sentiment']
      }
    }
  )
  .post('/analyze-file',
    async ({ body }) => {
      try {
        // The file content is sent as base64 encoded string
        const fileContent = Buffer.from(body.fileContent, 'base64').toString('utf-8');
        const fileType = body.fileType;
        
        const texts = await processFile(fileContent, fileType);
        const results = await Promise.all(texts.map(text => analyzeSentiment(text)));
        
        return { results };
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'Failed to process file' };
      }
    },
    {
      body: t.Object({
        fileContent: t.String(),
        fileType: t.String()
      }),
      detail: {
        summary: 'Analyze sentiment from file content',
        tags: ['sentiment']
      }
    }
  );