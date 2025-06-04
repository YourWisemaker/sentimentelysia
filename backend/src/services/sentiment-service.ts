import { ChatOpenRouter } from '../lib/openrouter';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Define the sentiment analysis result interface
export interface SentimentResult {
  text: string;
  score: number;
  magnitude: number;
  categories: string[];
  topPhrases: string[];
  entities: Array<{
    name: string;
    sentiment: number;
  }>;
}

// Initialize the OpenRouter client with Gemini Flash model
const model = new ChatOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key',
  model: 'google/gemini-flash',
  temperature: 0,
});

// Create a prompt template for sentiment analysis
const template = `
Analyze the sentiment of the following text and provide a detailed breakdown. 
Return the result as a valid JSON object with the following structure:

JSON_START
  "score": (number between -1 and 1, where -1 is very negative, 0 is neutral, and 1 is very positive),
  "magnitude": (number between 0 and 1 indicating the strength of emotion),
  "categories": [array of topic categories present in the text],
  "topPhrases": [array of up to 5 most significant phrases],
  "entities": [array of objects with "name" and "sentiment" properties for entities mentioned]
JSON_END

Text to analyze: {text}
`;

const sentimentPromptTemplate = PromptTemplate.fromTemplate(template);

// Create a runnable sequence for sentiment analysis
const sentimentChain = sentimentPromptTemplate.pipe(model as any).pipe(new StringOutputParser() as any);

/**
 * Analyze the sentiment of a text using LangChain and OpenRouter's Gemini Flash model
 * @param text The text to analyze
 * @returns A promise that resolves to a SentimentResult object
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    // Get the sentiment analysis result from the model
    const result = await sentimentChain.invoke({ text }) as string;
    
    // Extract JSON from the response using the markers
    let jsonStr = result;
    if (result.includes('JSON_START') && result.includes('JSON_END')) {
      jsonStr = result.split('JSON_START')[1].split('JSON_END')[0].trim();
      // Wrap the extracted content in curly braces to make it valid JSON
      jsonStr = `{${jsonStr}}`;
    }
    
    // Parse the JSON response
    const parsedResult = JSON.parse(jsonStr) as {
      score: number;
      magnitude: number;
      categories?: string[];
      topPhrases?: string[];
      entities?: Array<{ name: string; sentiment: number }>;
    };
    
    // Return the complete sentiment result
    return {
      text,
      score: parsedResult.score,
      magnitude: parsedResult.magnitude,
      categories: parsedResult.categories || [],
      topPhrases: parsedResult.topPhrases || [],
      entities: parsedResult.entities || [],
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error(`Failed to analyze sentiment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}