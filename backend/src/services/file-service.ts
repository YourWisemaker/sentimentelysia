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

  if (lines.length === 0) {
    return [];
  }

  // Process each line to extract the text content
  const texts: string[] = [];
  let headerProcessed = false;
  let contentColumnIndex = -1;

  for (const line of lines) {
    // Parse CSV line properly handling quoted values
    const columns = parseCSVLine(line);
    
    // Check if this is the header row
    if (!headerProcessed) {
      headerProcessed = true;
      
      // Find the content column index
      for (let i = 0; i < columns.length; i++) {
        const header = columns[i].toLowerCase().trim();
        if (header === 'content' || header === 'text' || header === 'tweet' || header === 'post' || header === 'message') {
          contentColumnIndex = i;
          break;
        }
      }
      
      // If no specific content column found, assume it's the 3rd column (index 2) for tweet format
      if (contentColumnIndex === -1 && columns.length >= 3) {
        contentColumnIndex = 2; // Content column in tweet CSV format
      }
      
      // Skip header row
      continue;
    }

    // Extract content from the identified column
    if (contentColumnIndex >= 0 && contentColumnIndex < columns.length) {
      const content = columns[contentColumnIndex].trim();
      if (content && content !== '') {
        texts.push(content);
      }
    } else if (columns.length > 0) {
      // Fallback to first column if no content column identified
      const content = columns[0].trim();
      if (content && content !== '') {
        texts.push(content);
      }
    }
  }

  return texts;
}

/**
 * Parse a single CSV line handling quoted values properly
 * @param line The CSV line to parse
 * @returns Array of column values
 */
function parseCSVLine(line: string): string[] {
  const columns: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of column
      columns.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last column
  columns.push(current);
  
  return columns;
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