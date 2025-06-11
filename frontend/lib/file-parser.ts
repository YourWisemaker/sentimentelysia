/**
 * Parse CSV file content and extract tweets
 * @param csvContent The content of the CSV file as a string
 * @returns Array of tweets extracted from the CSV
 */
export function parseCSV(csvContent: string): string[] {
  // Split the content by newlines
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== "")

  if (lines.length === 0) {
    return []
  }

  // Process each line to extract the tweet content
  const tweets: string[] = []
  let headerProcessed = false
  let contentColumnIndex = -1

  for (const line of lines) {
    // Parse CSV line properly handling quoted values
    const columns = parseCSVLine(line)
    
    // Check if this is the header row
    if (!headerProcessed) {
      headerProcessed = true
      
      // Find the content column index
      for (let i = 0; i < columns.length; i++) {
        const header = columns[i].toLowerCase().trim()
        if (header === 'content' || header === 'text' || header === 'tweet' || header === 'post' || header === 'message') {
          contentColumnIndex = i
          break
        }
      }
      
      // If no specific content column found, assume it's the 3rd column (index 2) for tweet format
      if (contentColumnIndex === -1 && columns.length >= 3) {
        contentColumnIndex = 2 // Content column in tweet CSV format
      }
      
      // Skip header row
      continue
    }

    // Extract content from the identified column
    if (contentColumnIndex >= 0 && contentColumnIndex < columns.length) {
      const content = columns[contentColumnIndex].trim()
      if (content && content !== '') {
        tweets.push(content)
      }
    } else if (columns.length > 0) {
      // Fallback to first column if no content column identified
      const content = columns[0].trim()
      if (content && content !== '') {
        tweets.push(content)
      }
    }
  }

  return tweets
}

/**
 * Parse a single CSV line handling quoted values properly
 * @param line The CSV line to parse
 * @returns Array of column values
 */
function parseCSVLine(line: string): string[] {
  const columns: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // End of column
      columns.push(current)
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }
  
  // Add the last column
  columns.push(current)
  
  return columns
}
