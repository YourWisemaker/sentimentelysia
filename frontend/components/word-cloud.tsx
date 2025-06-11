"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SentimentResult } from "@/lib/sentiment-analyzer"
import { Cloud } from "lucide-react"
import dynamic from "next/dynamic"
import { useMemo, useCallback } from "react"

// Dynamically import WordCloud to avoid SSR issues
const ReactWordCloud = dynamic(() => import("react-d3-cloud"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[400px] text-gray-500">
      <div className="text-center">
        <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
        <p>Loading word cloud...</p>
      </div>
    </div>
  ),
})

interface WordCloudProps {
  data: SentimentResult[]
  sentimentFilter?: 'all' | 'positive' | 'negative' | 'neutral'
  title?: string
  description?: string
}

export function WordCloud({ data, sentimentFilter = 'all', title = 'Word Cloud', description = 'Most frequently used words in analyzed content' }: WordCloudProps) {
  // Return nothing if no data
  if (!data || data.length === 0) {
    return null
  }

  // Filter data based on sentiment
  const filteredData = useMemo(() => {
    switch (sentimentFilter) {
      case 'positive':
        return data.filter(item => item.score > 0.1)
      case 'negative':
        return data.filter(item => item.score < -0.1)
      case 'neutral':
        return data.filter(item => item.score >= -0.1 && item.score <= 0.1)
      default:
        return data
    }
  }, [data, sentimentFilter])

  // Extract and count words
  const wordCounts = (filteredData || []).reduce(
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

  // Convert word counts to react-wordcloud format
  const words = Object.entries(wordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 100)
    .map(([text, value]) => ({ text: String(text), value: Number(value) }))
    .filter(word => word.text && word.text.length > 0 && word.value > 0 && !isNaN(word.value))



  // Calculate font size based on word frequency
  const fontSize = useCallback((word: { value: number }) => {
    if (!words || words.length === 0) return 20
    const maxCount = Math.max(...words.map(w => w.value))
    const minCount = Math.min(...words.map(w => w.value))
    const normalizedSize = (word.value - minCount) / (maxCount - minCount || 1)
    return Math.max(16, Math.min(80, 16 + normalizedSize * 64))
  }, [words])

  // Calculate rotation for words
  const rotate = useCallback(() => {
    return Math.random() > 0.7 ? (Math.random() - 0.5) * 60 : 0
  }, [])

  // Color function for words based on sentiment filter
  const fill = useCallback((d: any, i: number) => {
    let colors: string[]
    
    switch (sentimentFilter) {
      case 'positive':
        colors = [
          '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
          '#84cc16', '#65a30d', '#4d7c0f', '#365314', '#1a2e05',
          '#10b981', '#059669', '#047857', '#065f46', '#064e3b'
        ]
        break
      case 'negative':
        colors = [
          '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
          '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
          '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843'
        ]
        break
      case 'neutral':
        colors = [
          '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12',
          '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
          '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'
        ]
        break
      default:
        colors = [
          '#2E8B57', '#FF6347', '#4169E1', '#32CD32', '#FF4500',
          '#9932CC', '#FF1493', '#00CED1', '#FFD700', '#DC143C',
          '#228B22', '#FF69B4', '#1E90FF', '#FFA500', '#8A2BE2',
          '#00FA9A', '#FF0000', '#0000FF', '#ADFF2F', '#FF6B6B',
          '#8B4513', '#FF8C00', '#9370DB', '#20B2AA', '#CD853F'
        ]
    }
    
    return colors[i % colors.length]
  }, [sentimentFilter])

  // Font weight calculation
  const fontWeight = useCallback((word: { value: number }) => {
    if (!words || words.length === 0) return 'normal'
    const maxCount = Math.max(...words.map(w => w.value))
    const minCount = Math.min(...words.map(w => w.value))
    const normalizedSize = (word.value - minCount) / (maxCount - minCount || 1)
    if (normalizedSize > 0.8) return 'bold'
    if (normalizedSize > 0.5) return '600'
    return 'normal'
  }, [words])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px] w-full">
          {words && words.length > 0 ? (
            <div className="w-full h-[400px] bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg overflow-hidden">
              <ReactWordCloud
                 data={words.slice(0, 80)}
                 width={800}
                 height={400}
                 font="system-ui"
                 fontStyle="normal"
                 fontWeight={fontWeight}
                 fontSize={fontSize}
                 rotate={rotate}
                 spiral="archimedean"
                 padding={2}
                 random={() => 0.5}
                 fill={fill}
                 onWordClick={(event: any, d: any) => {
                   console.log(`Clicked: ${d.text} (${d.value} occurrences)`)
                 }}
               />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center">
                <Cloud className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No words to display</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
