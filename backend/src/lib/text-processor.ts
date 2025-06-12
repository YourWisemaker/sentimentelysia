/**
 * Backend text processing utilities using Natural library
 * Provides advanced stop words filtering and stemming
 */

import { PorterStemmer, stopwords } from 'natural';

// Extended stop words list combining Natural's stopwords with custom additions
const EXTENDED_STOP_WORDS = new Set([
  ...stopwords,
  // Social media specific
  'rt', 'via', 'cc', 'bcc', 'fwd', 'lol', 'omg', 'wtf', 'btw', 'imo', 'imho',
  'dm', 'pm', 'am', 'pm', 'est', 'pst', 'gmt', 'utc',
  // Internet specific
  'http', 'https', 'www', 'com', 'org', 'net', 'edu', 'gov', 'html', 'php',
  'asp', 'jsp', 'url', 'link', 'click', 'here', 'read', 'more',
  // Common contractions (without apostrophes)
  'dont', 'wont', 'cant', 'shouldnt', 'wouldnt', 'couldnt', 'isnt', 'arent',
  'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'didnt', 'doesnt',
  'im', 'youre', 'hes', 'shes', 'its', 'were', 'theyre', 'ive', 'youve',
  'weve', 'theyve', 'ill', 'youll', 'hell', 'shell', 'well', 'theyll',
  // Numbers and common short words
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'first', 'second', 'third', 'last', 'next', 'previous', 'new', 'old',
  // Common filler words
  'like', 'just', 'really', 'actually', 'basically', 'literally', 'totally',
  'definitely', 'probably', 'maybe', 'perhaps', 'quite', 'rather', 'pretty',
  // Time-related
  'today', 'tomorrow', 'yesterday', 'now', 'then', 'soon', 'later', 'early',
  'late', 'morning', 'afternoon', 'evening', 'night', 'day', 'week', 'month',
  'year', 'time', 'times', 'moment', 'moments'
]);

/**
 * Check if a word is a stop word
 * @param word The word to check
 * @returns True if the word is a stop word
 */
export function isStopWord(word: string): boolean {
  return EXTENDED_STOP_WORDS.has(word.toLowerCase());
}

/**
 * Apply stemming to a word using Porter Stemmer
 * @param word The word to stem
 * @returns The stemmed word
 */
export function stemWord(word: string): string {
  if (word.length <= 2) return word;
  return PorterStemmer.stem(word.toLowerCase());
}

/**
 * Process text by cleaning, filtering stop words, and applying stemming
 * @param text The text to process
 * @param options Processing options
 * @returns Array of processed words
 */
export function processText(
  text: string,
  options: {
    removeStopWords?: boolean;
    applyStemming?: boolean;
    minWordLength?: number;
    removeNumbers?: boolean;
    removeUrls?: boolean;
    removePunctuation?: boolean;
  } = {}
): string[] {
  const {
    removeStopWords = true,
    applyStemming = true,
    minWordLength = 3,
    removeNumbers = true,
    removeUrls = true,
    removePunctuation = true
  } = options;
  
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  let processedText = text.toLowerCase();
  
  // Remove URLs and email addresses
  if (removeUrls) {
    processedText = processedText.replace(/https?:\/\/[^\s]+/g, ' ');
    processedText = processedText.replace(/www\.[^\s]+/g, ' ');
    processedText = processedText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' ');
  }
  
  // Remove hashtags and mentions but keep the text
  processedText = processedText.replace(/#([a-zA-Z0-9_]+)/g, '$1');
  processedText = processedText.replace(/@([a-zA-Z0-9_]+)/g, '$1');
  
  // Remove punctuation and special characters
  if (removePunctuation) {
    processedText = processedText.replace(/[^a-z0-9\s]/g, ' ');
  }
  
  // Split into words and filter
  let words = processedText
    .split(/\s+/)
    .filter(word => word.length >= minWordLength);
  
  // Remove pure numbers if specified
  if (removeNumbers) {
    words = words.filter(word => !/^\d+$/.test(word));
  }
  
  // Remove stop words
  if (removeStopWords) {
    words = words.filter(word => !isStopWord(word));
  }
  
  // Apply stemming
  if (applyStemming) {
    words = words.map(word => stemWord(word));
  }
  
  // Remove empty strings and duplicates while preserving order
  return [...new Set(words.filter(word => word.length > 0))];
}

/**
 * Extract meaningful phrases from text
 * @param text The text to extract phrases from
 * @param maxPhrases Maximum number of phrases to return
 * @returns Array of meaningful phrases
 */
export function extractTopPhrases(
  text: string,
  maxPhrases: number = 5
): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Only meaningful sentences
  
  // Extract noun phrases and meaningful segments
  const phrases: string[] = [];
  
  sentences.forEach(sentence => {
    // Look for patterns like "adjective + noun" or "noun + noun"
    const words = sentence.toLowerCase().split(/\s+/);
    
    // Extract 2-4 word phrases that don't start with stop words
    for (let i = 0; i < words.length - 1; i++) {
      for (let len = 2; len <= Math.min(4, words.length - i); len++) {
        const phrase = words.slice(i, i + len).join(' ');
        
        // Skip if starts with stop word or contains only stop words
        if (!isStopWord(words[i]) && phrase.length > 5) {
          const cleanPhrase = phrase.replace(/[^a-z\s]/g, '').trim();
          if (cleanPhrase.length > 5 && !phrases.includes(cleanPhrase)) {
            phrases.push(cleanPhrase);
          }
        }
      }
    }
  });
  
  // Sort by length (longer phrases are often more meaningful) and return top phrases
  return phrases
    .sort((a, b) => b.length - a.length)
    .slice(0, maxPhrases);
}

/**
 * Extract and count words from multiple texts
 * @param texts Array of texts to process
 * @param options Processing options
 * @returns Object with word counts
 */
export function extractWordCounts(
  texts: string[],
  options: {
    removeStopWords?: boolean;
    applyStemming?: boolean;
    minWordLength?: number;
    removeNumbers?: boolean;
    removeUrls?: boolean;
    maxWords?: number;
  } = {}
): Record<string, number> {
  const { maxWords = 100, ...processOptions } = options;
  const wordCounts: Record<string, number> = {};
  
  texts.forEach(text => {
    const words = processText(text, processOptions);
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });
  
  // Sort by frequency and limit to maxWords
  const sortedWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxWords);
  
  return Object.fromEntries(sortedWords);
}