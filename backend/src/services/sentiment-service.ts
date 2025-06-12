import { ChatOpenRouter } from '../lib/openrouter';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { extractTopPhrases, processText } from '../lib/text-processor';

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
  model: 'google/gemini-flash-1.5',
  temperature: 0,
});

// Create a prompt template for sentiment analysis
const template = `
You are a sentiment analysis API. You MUST respond ONLY with valid JSON. Do not include any explanatory text, commentary, or markdown formatting.

Analyze the sentiment of the following text and return ONLY a valid JSON object with this exact structure:

{{
  "score": (number between -1 and 1),
  "magnitude": (number between 0 and 1),
  "categories": ["array", "of", "topic", "categories"],
  "topPhrases": ["array", "of", "up", "to", "5", "phrases"],
  "entities": [{{"name": "entity_name", "sentiment": 0.0}}]
}}

Text to analyze: {text}

Respond with JSON only:
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
  let result: string = '';
  let jsonStr: string = '';
  
  try {
    // Get the sentiment analysis result from the model
    result = await sentimentChain.invoke({ text }) as string;
    console.log('Raw AI response:', result);
    
    // Extract JSON from the response
    jsonStr = result.trim();
    
    // Try to find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    } else {
      // If no JSON found, try to extract from markers if they exist
      if (result.includes('JSON_START') && result.includes('JSON_END')) {
        const startIndex = result.indexOf('JSON_START') + 'JSON_START'.length;
        const endIndex = result.indexOf('JSON_END');
        jsonStr = result.substring(startIndex, endIndex).trim();
        
        // Only wrap in braces if it doesn't already start and end with them
        if (!jsonStr.startsWith('{') && !jsonStr.endsWith('}')) {
          jsonStr = `{${jsonStr}}`;
        }
      } else {
        // If no JSON structure found, create a fallback based on simple analysis
        console.warn('No JSON structure found in AI response, creating fallback');
        const isPositive = /good|great|excellent|positive|happy|love|amazing|wonderful/i.test(text);
        const isNegative = /bad|terrible|awful|negative|sad|hate|horrible|disgusting/i.test(text);
        const score = isPositive ? 0.5 : (isNegative ? -0.5 : 0);
        
        jsonStr = JSON.stringify({
          score,
          magnitude: 0.5,
          categories: ['general'],
          topPhrases: text.split(' ').slice(0, 5),
          entities: []
        });
      }
    }
    
    // Clean the JSON string to remove markdown formatting and other issues
    jsonStr = jsonStr
      .replace(/```json/g, '')  // Remove markdown json code block start
      .replace(/```/g, '')      // Remove markdown code block markers
      .replace(/`/g, '')        // Remove any remaining backticks
      .replace(/\n/g, ' ')      // Replace newlines with spaces
      .replace(/\s+/g, ' ')     // Replace multiple spaces with single space
      .trim();
    
    // Ensure the JSON string starts and ends with curly braces (only if needed)
    if (!jsonStr.startsWith('{')) {
      jsonStr = '{' + jsonStr;
    }
    if (!jsonStr.endsWith('}')) {
      jsonStr = jsonStr + '}';
    }
    
    console.log('Cleaned JSON string:', jsonStr);
    
    // Validate JSON before parsing
    let parsedResult: any;
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Problematic JSON string:', jsonStr);
      
      // Fallback: try to extract a simpler JSON structure
      const fallbackResult = {
        score: 0,
        magnitude: 0.5,
        categories: ['general'],
        topPhrases: [text.substring(0, 50)],
        entities: []
      };
      
      return {
        text,
        ...fallbackResult
      };
    }
    
    // Enhance topPhrases with better text processing
    let enhancedTopPhrases = Array.isArray(parsedResult.topPhrases) ? parsedResult.topPhrases : [];
    
    // If AI didn't provide good phrases or provided too few, extract them using text processing
    if (enhancedTopPhrases.length < 3) {
      const extractedPhrases = extractTopPhrases(text, 5);
      enhancedTopPhrases = [...enhancedTopPhrases, ...extractedPhrases].slice(0, 5);
    }
    
    // If still no phrases, fall back to processed words
    if (enhancedTopPhrases.length === 0) {
      const processedWords = processText(text, {
        removeStopWords: true,
        applyStemming: false, // Keep original form for phrases
        minWordLength: 4,
        removeNumbers: true,
        removeUrls: true
      });
      enhancedTopPhrases = processedWords.slice(0, 5);
    }
    
    // Validate required fields and provide defaults
    const validatedResult = {
      score: typeof parsedResult.score === 'number' ? parsedResult.score : 0,
      magnitude: typeof parsedResult.magnitude === 'number' ? parsedResult.magnitude : 0.5,
      categories: Array.isArray(parsedResult.categories) ? parsedResult.categories : ['general'],
      topPhrases: enhancedTopPhrases,
      entities: Array.isArray(parsedResult.entities) ? parsedResult.entities : []
    };
    
    // Return the complete sentiment result
    return {
      text,
      ...validatedResult
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    console.error('Raw response:', result);
    console.error('JSON string:', jsonStr);
    
    // Return a fallback result instead of throwing
    return {
      text,
      score: 0,
      magnitude: 0.5,
      categories: ['error'],
      topPhrases: ['Analysis failed'],
      entities: []
    };
  }
}