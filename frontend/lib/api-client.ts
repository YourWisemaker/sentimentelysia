/**
 * API client for interacting with the sentiment analysis backend
 */

import { SentimentResult } from './sentiment-analyzer';

// Get API base URL with fallback for client-side rendering
const API_BASE_URL = typeof window !== 'undefined' 
  ? (window.ENV_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

/**
 * Analyze text sentiment using the backend API
 * @param text The text to analyze
 * @returns Promise with sentiment analysis result
 */
export async function analyzeTextSentiment(text: string): Promise<SentimentResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
}

/**
 * Analyze sentiment from file content
 * @param file The file to analyze
 * @returns Promise with array of sentiment analysis results
 */
export async function analyzeFileSentiment(file: File): Promise<SentimentResult[]> {
  try {
    // Read file as base64
    const fileContent = await readFileAsBase64(file);
    const fileType = file.name.split('.').pop() || '';

    const response = await fetch(`${API_BASE_URL}/analyze-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileContent,
        fileType,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error analyzing file sentiment:', error);
    throw error;
  }
}

/**
 * Read a file as base64 encoded string
 * @param file The file to read
 * @returns Promise with base64 encoded file content
 */
async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract base64 data from data URL
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}