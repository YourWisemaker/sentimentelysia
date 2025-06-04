export interface SentimentResult {
  text: string;
  score: number;
  magnitude: number;
  categories?: string[];
  topPhrases?: string[];
  entities?: Array<{
    name: string;
    type: string;
    sentiment: number;
  }>;
}

import { analyzeTextSentiment, analyzeFileSentiment } from './api-client';

// Analyze sentiment using the backend API
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    // Use the API client to analyze sentiment
    return await analyzeTextSentiment(text);
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    
    // Fallback to local analysis if API fails
    return fallbackAnalyzeSentiment(text);
  }
}

// Analyze sentiment from a file
export async function analyzeSentimentFromFile(file: File): Promise<SentimentResult[]> {
  try {
    // Use the API client to analyze file sentiment
    return await analyzeFileSentiment(file);
  } catch (error) {
    console.error('Error analyzing file sentiment:', error);
    throw error;
  }
}

// Fallback sentiment analysis using keyword-based approach
// Used when the API is not available
function fallbackAnalyzeSentiment(text: string): SentimentResult {
  const positiveWords = [
    "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome",
    "love", "like", "happy", "pleased", "satisfied", "perfect", "brilliant",
    "outstanding", "superb", "magnificent", "delighted", "thrilled", "excited",
    "grateful", "thankful", "appreciate", "recommend", "best", "beautiful",
    "incredible", "impressive", "remarkable", "exceptional", "marvelous", "splendid",
  ]

  const negativeWords = [
    "bad", "terrible", "awful", "horrible", "hate", "dislike", "angry", "frustrated",
    "disappointed", "sad", "upset", "annoyed", "disgusted", "furious", "outraged",
    "devastated", "heartbroken", "miserable", "depressed", "worried", "concerned",
    "troubled", "bothered", "irritated", "worst", "useless", "worthless", "pathetic",
    "ridiculous", "stupid", "idiotic", "nonsense", "garbage",
  ]

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)

  let positiveScore = 0
  let negativeScore = 0

  words.forEach((word) => {
    if (positiveWords.includes(word)) {
      positiveScore += 1
    }
    if (negativeWords.includes(word)) {
      negativeScore += 1
    }
  })

  // Add some randomness to make it more realistic
  const randomFactor = (Math.random() - 0.5) * 0.2

  // Calculate final score (-1 to 1)
  const totalWords = words.length || 1
  const score = Math.max(-1, Math.min(1, ((positiveScore - negativeScore) / totalWords) * 2 + randomFactor))

  // Calculate magnitude (0 to 1)
  const magnitude = Math.min(1, (positiveScore + negativeScore) / totalWords + Math.abs(randomFactor))

  // Generate mock data for the new fields
  const topPhrases = words
    .filter(word => positiveWords.includes(word) || negativeWords.includes(word))
    .slice(0, 5);
    
  const categories = ['General'];
  
  return {
    text,
    score,
    magnitude,
    topPhrases,
    categories,
    entities: [],
  }
}
