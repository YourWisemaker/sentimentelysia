/**
 * Text processing utilities for sentiment analysis
 * Includes stop words filtering and stemming functionality
 */

// Comprehensive list of English stop words
const STOP_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Pronouns
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  // Prepositions
  'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around', 'at',
  'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond', 'by',
  'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into', 'like',
  'near', 'of', 'off', 'on', 'outside', 'over', 'since', 'through', 'throughout',
  'till', 'to', 'toward', 'under', 'until', 'up', 'upon', 'with', 'within', 'without',
  // Conjunctions
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since',
  'unless', 'while', 'where', 'whereas', 'wherever', 'whether', 'which', 'whichever',
  'who', 'whoever', 'whom', 'whose', 'why', 'how',
  // Common verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'can', 'shall',
  // Common adverbs
  'not', 'no', 'yes', 'very', 'too', 'more', 'most', 'much', 'many', 'few',
  'little', 'less', 'least', 'only', 'just', 'even', 'also', 'still', 'yet',
  'already', 'always', 'never', 'sometimes', 'often', 'usually', 'again',
  'here', 'there', 'now', 'then', 'today', 'tomorrow', 'yesterday',
  // Common adjectives
  'good', 'bad', 'big', 'small', 'large', 'great', 'little', 'old', 'new',
  'first', 'last', 'long', 'short', 'high', 'low', 'right', 'left', 'next',
  'other', 'another', 'same', 'different',
  // Common nouns
  'time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life',
  'hand', 'part', 'child', 'eye', 'woman', 'place', 'work', 'week', 'case',
  'point', 'government', 'company', 'number', 'group', 'problem', 'fact',
  // Internet/Social media specific
  'http', 'https', 'www', 'com', 'org', 'net', 'html', 'php', 'asp', 'jsp',
  'rt', 'via', 'cc', 'bcc', 'fwd', 'lol', 'omg', 'wtf', 'btw', 'imo', 'imho',
  // Common contractions (without apostrophes)
  'dont', 'wont', 'cant', 'shouldnt', 'wouldnt', 'couldnt', 'isnt', 'arent',
  'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'didnt', 'doesnt',
  'im', 'youre', 'hes', 'shes', 'its', 'were', 'theyre', 'ive', 'youve',
  'weve', 'theyve', 'ill', 'youll', 'hell', 'shell', 'well', 'theyll',
  // Additional common words
  'said', 'get', 'go', 'know', 'take', 'see', 'come', 'think', 'look', 'want',
  'give', 'use', 'find', 'tell', 'ask', 'seem', 'feel', 'try', 'leave', 'call',
  'back', 'out', 'up', 'down', 'off', 'over', 'under', 'again', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'hundred', 'thousand', 'million', 'billion'
]);

// Simple stemming rules (Porter Stemmer simplified)
const STEMMING_RULES = [
  // Step 1a
  { pattern: /sses$/i, replacement: 'ss' },
  { pattern: /ies$/i, replacement: 'i' },
  { pattern: /ss$/i, replacement: 'ss' },
  { pattern: /s$/i, replacement: '' },
  
  // Step 1b
  { pattern: /(eed)$/i, replacement: 'ee' },
  { pattern: /(ed|ing)$/i, replacement: '' },
  
  // Step 2
  { pattern: /(ational)$/i, replacement: 'ate' },
  { pattern: /(tional)$/i, replacement: 'tion' },
  { pattern: /(enci)$/i, replacement: 'ence' },
  { pattern: /(anci)$/i, replacement: 'ance' },
  { pattern: /(izer)$/i, replacement: 'ize' },
  { pattern: /(abli)$/i, replacement: 'able' },
  { pattern: /(alli)$/i, replacement: 'al' },
  { pattern: /(entli)$/i, replacement: 'ent' },
  { pattern: /(eli)$/i, replacement: 'e' },
  { pattern: /(ousli)$/i, replacement: 'ous' },
  { pattern: /(ization)$/i, replacement: 'ize' },
  { pattern: /(ation)$/i, replacement: 'ate' },
  { pattern: /(ator)$/i, replacement: 'ate' },
  { pattern: /(alism)$/i, replacement: 'al' },
  { pattern: /(iveness)$/i, replacement: 'ive' },
  { pattern: /(fulness)$/i, replacement: 'ful' },
  { pattern: /(ousness)$/i, replacement: 'ous' },
  { pattern: /(aliti)$/i, replacement: 'al' },
  { pattern: /(iviti)$/i, replacement: 'ive' },
  { pattern: /(biliti)$/i, replacement: 'ble' },
  
  // Step 3
  { pattern: /(icate)$/i, replacement: 'ic' },
  { pattern: /(ative)$/i, replacement: '' },
  { pattern: /(alize)$/i, replacement: 'al' },
  { pattern: /(iciti)$/i, replacement: 'ic' },
  { pattern: /(ical)$/i, replacement: 'ic' },
  { pattern: /(ful)$/i, replacement: '' },
  { pattern: /(ness)$/i, replacement: '' },
  
  // Step 4
  { pattern: /(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ion|ou|ism|ate|iti|ous|ive|ize)$/i, replacement: '' },
  
  // Step 5a
  { pattern: /e$/i, replacement: '' },
  
  // Step 5b
  { pattern: /(ll)$/i, replacement: 'l' }
];

/**
 * Apply simple stemming to a word using Porter Stemmer rules
 * @param word The word to stem
 * @returns The stemmed word
 */
export function stemWord(word: string): string {
  if (word.length <= 2) return word;
  
  let stemmed = word.toLowerCase();
  
  // Apply stemming rules in order
  for (const rule of STEMMING_RULES) {
    if (rule.pattern.test(stemmed)) {
      stemmed = stemmed.replace(rule.pattern, rule.replacement);
      break; // Apply only the first matching rule
    }
  }
  
  return stemmed;
}

/**
 * Check if a word is a stop word
 * @param word The word to check
 * @returns True if the word is a stop word
 */
export function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase());
}

/**
 * Process text by removing stop words and applying stemming
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
  } = {}
): string[] {
  const {
    removeStopWords = true,
    applyStemming = true,
    minWordLength = 3,
    removeNumbers = true,
    removeUrls = true
  } = options;
  
  let processedText = text.toLowerCase();
  
  // Remove URLs
  if (removeUrls) {
    processedText = processedText.replace(/https?:\/\/[^\s]+/g, '');
    processedText = processedText.replace(/www\.[^\s]+/g, '');
  }
  
  // Remove punctuation and special characters, keep only letters and spaces
  processedText = processedText.replace(/[^a-z\s]/g, ' ');
  
  // Split into words and filter
  let words = processedText
    .split(/\s+/)
    .filter(word => word.length >= minWordLength);
  
  // Remove numbers if specified
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
  
  return words.filter(word => word.length > 0);
}

/**
 * Extract and count words from text with advanced processing
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
    if (!text || typeof text !== 'string') return;
    
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