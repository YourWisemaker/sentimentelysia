import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { createObjectCsvStringifier } from 'csv-writer';
import { analyzeSentiment } from './sentiment-service';

export interface TweetData {
  'Tweet ID': string;
  URL: string;
  Content: string;
  Likes: string;
  Retweets: string;
  Replies: string;
  Quotes: string;
  Views: string;
  Date: string;
}

export async function processCsvFile(filePath: string): Promise<string> {
  try {
    // Read and parse the CSV file
    const fileContent = readFileSync(filePath, 'utf-8');
    
    // Detect delimiter
    const firstLine = fileContent.split('\n')[0];
    let delimiter = ',';
    if (firstLine.includes(';') && !firstLine.includes(',')) {
      delimiter = ';';
    } else if (firstLine.includes('\t')) {
      delimiter = '\t';
    }
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: delimiter,
      relax_quotes: true,
      escape: '"',
      quote: '"'
    }) as TweetData[];
    
    if (records.length === 0) {
      throw new Error('No valid records found in CSV file');
    }

    // Process each tweet
    const processedRecords = await Promise.all(
      records.map(async (record) => {
        // Get sentiment analysis
        const sentiment = await analyzeSentiment(record.Content);
        
        // Add sentiment data to the record
        return {
          ...record,
          'Sentiment Score': sentiment.score.toString(),
          'Sentiment Magnitude': sentiment.magnitude.toString(),
          'Sentiment Categories': sentiment.categories.join(','),
          'Top Phrases': sentiment.topPhrases.join(','),
          'Entities': sentiment.entities.map(e => `${e.name}:${e.sentiment}`).join(',')
        };
      })
    );

    // Convert back to CSV
    const stringifier = createObjectCsvStringifier({
      header: Object.keys(processedRecords[0])
    });
    const output = stringifier.stringifyRecords(processedRecords);

    // Save to new file
    const outputFilePath = `${filePath.split('.')[0]}_sentiment.csv`;
    writeFileSync(outputFilePath, output);

    return outputFilePath;
  } catch (error) {
    throw new Error(`Failed to process CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
