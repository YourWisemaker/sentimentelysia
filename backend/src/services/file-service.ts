/**
 * Process different file types and extract text content for sentiment analysis
 */

/**
 * Process a file and extract text content based on file type
 * @param fileContent The content of the file as a string
 * @param fileType The type/extension of the file (csv, txt, etc.)
 * @returns Array of text strings extracted from the file
 */
export async function processFile(fileContent: string, fileType: string): Promise<string[]> {
  switch (fileType.toLowerCase()) {
    case 'csv':
      return parseCSV(fileContent);
    case 'txt':
      return parseTXT(fileContent);
    case 'json':
      return parseJSON(fileContent);
    default:
      throw new Error(`Unsupported file type: ${fileType}. Supported types are: csv, txt, json`);
  }
}

/**
 * Parse CSV file content and extract text
 * @param csvContent The content of the CSV file as a string
 * @returns Array of text extracted from the CSV
 */
function parseCSV(csvContent: string): string[] {
  // Split the content by newlines
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '');

  // Process each line to extract the text content
  const texts: string[] = [];

  for (const line of lines) {
    // Check if the line is a CSV header (common headers)
    if (
      line.toLowerCase().includes('tweet') ||
      line.toLowerCase().includes('text') ||
      line.toLowerCase().includes('content') ||
      line.toLowerCase().includes('post')
    ) {
      continue; // Skip header row
    }

    // Handle quoted CSV values
    if (line.includes('"')) {
      // Extract content between quotes
      const matches = line.match(/"([^"]+)"/);
      if (matches && matches[1]) {
        texts.push(matches[1].trim());
        continue;
      }
    }

    // If no quotes or no match, just use the whole line or first column
    const columns = line.split(',');
    if (columns.length > 0) {
      texts.push(columns[0].trim());
    }
  }

  return texts;
}

/**
 * Parse plain text file content
 * @param txtContent The content of the text file
 * @returns Array of text strings (split by lines or paragraphs)
 */
function parseTXT(txtContent: string): string[] {
  // Split by paragraphs (double newlines) or single lines based on content length
  if (txtContent.includes('\n\n')) {
    return txtContent.split(/\n\n+/).filter(text => text.trim() !== '');
  } else {
    return txtContent.split(/\r?\n/).filter(text => text.trim() !== '');
  }
}

/**
 * Parse JSON file content
 * @param jsonContent The content of the JSON file as a string
 * @returns Array of text extracted from the JSON
 */
function parseJSON(jsonContent: string): string[] {
  try {
    const parsed = JSON.parse(jsonContent);
    
    // Handle array of strings
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed;
    }
    
    // Handle array of objects with text/content fields
    if (Array.isArray(parsed)) {
      return parsed
        .map(item => {
          if (typeof item !== 'object' || item === null) return null;
          
          // Look for common text field names
          const textField = 
            item.text || 
            item.content || 
            item.message || 
            item.tweet || 
            item.description;
            
          return typeof textField === 'string' ? textField : null;
        })
        .filter((text): text is string => text !== null);
    }
    
    throw new Error('JSON format not supported. Expected array of strings or objects with text fields');
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}