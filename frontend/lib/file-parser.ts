/**
 * Parse CSV file content and extract tweets
 * @param csvContent The content of the CSV file as a string
 * @returns Array of tweets extracted from the CSV
 */
export function parseCSV(csvContent: string): string[] {
  // Split the content by newlines
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== "")

  // Process each line to extract the tweet content
  const tweets: string[] = []

  for (const line of lines) {
    // Check if the line is a CSV header (common headers)
    if (
      line.toLowerCase().includes("tweet") ||
      line.toLowerCase().includes("text") ||
      line.toLowerCase().includes("content") ||
      line.toLowerCase().includes("post")
    ) {
      continue // Skip header row
    }

    // Handle quoted CSV values
    if (line.includes('"')) {
      // Extract content between quotes
      const matches = line.match(/"([^"]+)"/)
      if (matches && matches[1]) {
        tweets.push(matches[1].trim())
        continue
      }
    }

    // If no quotes or no match, just use the whole line or first column
    const columns = line.split(",")
    if (columns.length > 0) {
      tweets.push(columns[0].trim())
    }
  }

  return tweets
}
