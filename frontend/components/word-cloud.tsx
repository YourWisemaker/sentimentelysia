"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SentimentResult } from "@/lib/sentiment-analyzer"
import { Cloud } from "lucide-react"

interface WordCloudProps {
  data: SentimentResult[]
}

export function WordCloud({ data }: WordCloudProps) {
  // Extract and count words
  const wordCounts = data.reduce(
    (acc, item) => {
      // Check if item.text exists before processing
      if (!item.text) {
        return acc;
      }
      
      const words = item.text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 3 &&
            ![
              "this",
              "that",
              "with",
              "have",
              "will",
              "from",
              "they",
              "been",
              "were",
              "said",
              "each",
              "which",
              "their",
              "time",
              "would",
              "there",
              "could",
              "other",
            ].includes(word),
        )

      words.forEach((word) => {
        acc[word] = (acc[word] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const sortedWords = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)

  const maxCount = Math.max(...sortedWords.map(([, count]) => count))

  const getWordSize = (count: number) => {
    const ratio = count / maxCount
    return Math.max(12, Math.min(48, 12 + ratio * 36))
  }

  const getWordColor = (word: string) => {
    const colors = [
      "text-blue-500",
      "text-green-500",
      "text-purple-500",
      "text-red-500",
      "text-yellow-500",
      "text-indigo-500",
      "text-pink-500",
      "text-teal-500",
    ]
    return colors[word.length % colors.length]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Word Cloud
        </CardTitle>
        <CardDescription>Most frequently used words in analyzed content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center items-center min-h-[400px] p-4">
          {sortedWords.map(([word, count]) => (
            <span
              key={word}
              className={`font-semibold transition-all hover:scale-110 cursor-pointer ${getWordColor(word)}`}
              style={{ fontSize: `${getWordSize(count)}px` }}
              title={`${word}: ${count} occurrences`}
            >
              {word}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
