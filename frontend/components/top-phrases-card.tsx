"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SentimentResult } from "@/lib/sentiment-analyzer"
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"

interface TopPhrasesCardProps {
  data: SentimentResult[]
}

export function TopPhrasesCard({ data }: TopPhrasesCardProps) {
  // Return nothing if no data
  if (!data || data.length === 0) {
    return null
  }

  // Extract phrases (2-3 word combinations)
  const extractPhrases = (text: string) => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)

    const phrases = []
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`)
      if (i < words.length - 2) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`)
      }
    }
    return phrases
  }

  // Get positive and negative phrases
  const positiveData = data.filter((d) => d.score > 0.1)
  const negativeData = data.filter((d) => d.score < -0.1)

  const getTopPhrases = (sentimentData: SentimentResult[]) => {
    const phraseCounts: Record<string, number> = {}

    sentimentData.forEach((item) => {
      const phrases = extractPhrases(item.text)
      phrases.forEach((phrase) => {
        phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1
      })
    })

    return Object.entries(phraseCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }))
  }

  const topPositivePhrases = getTopPhrases(positiveData)
  const topNegativePhrases = getTopPhrases(negativeData)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Top Positive & Negative Phrases
        </CardTitle>
        <CardDescription>Most frequently occurring phrases in positive and negative content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Positive Phrases */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold text-green-700">Top Positive Phrases</h3>
            </div>
            <div className="space-y-2">
              {topPositivePhrases.map(({ phrase, count }, index) => (
                <div key={phrase} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">
                    {index + 1}. {phrase}
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {count}
                  </Badge>
                </div>
              ))}
              {topPositivePhrases.length === 0 && (
                <p className="text-sm text-gray-500 italic">No positive phrases found</p>
              )}
            </div>
          </div>

          {/* Negative Phrases */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold text-red-700">Top Negative Phrases</h3>
            </div>
            <div className="space-y-2">
              {topNegativePhrases.map(({ phrase, count }, index) => (
                <div key={phrase} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-800">
                    {index + 1}. {phrase}
                  </span>
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    {count}
                  </Badge>
                </div>
              ))}
              {topNegativePhrases.length === 0 && (
                <p className="text-sm text-gray-500 italic">No negative phrases found</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
