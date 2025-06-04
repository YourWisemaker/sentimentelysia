"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Cell } from "recharts"
import type { SentimentResult } from "@/lib/sentiment-analyzer"
import { Network } from "lucide-react"

interface SentimentCorrelationMapProps {
  data: SentimentResult[]
}

export function SentimentCorrelationMap({ data }: SentimentCorrelationMapProps) {
  // Create correlation data based on text length vs sentiment
  const correlationData = data.map((item, index) => ({
    textLength: item.text ? item.text.length : 0,
    sentiment: item.score,
    index,
    category: item.score > 0.1 ? "positive" : item.score < -0.1 ? "negative" : "neutral",
  }))

  // Calculate word count vs sentiment correlation
  const wordCountData = data.map((item, index) => ({
    wordCount: item.text ? item.text.split(/\s+/).length : 0,
    sentiment: item.score,
    index,
    category: item.score > 0.1 ? "positive" : item.score < -0.1 ? "negative" : "neutral",
  }))

  const chartConfig = {
    sentiment: {
      label: "Sentiment Score",
      color: "hsl(var(--chart-1))",
    },
  }

  const getColor = (category: string) => {
    switch (category) {
      case "positive":
        return "#22c55e"
      case "negative":
        return "#ef4444"
      default:
        return "#eab308"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Sentiment Correlation Map
          </CardTitle>
          <CardDescription>Correlation between text characteristics and sentiment scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Text Length vs Sentiment */}
            <div className="space-y-2">
              <h3 className="font-medium">Text Length vs Sentiment</h3>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart data={correlationData}>
                    <XAxis
                      dataKey="textLength"
                      type="number"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Text Length (characters)", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      dataKey="sentiment"
                      domain={[-1, 1]}
                      tick={{ fontSize: 12 }}
                      label={{ value: "Sentiment", angle: -90, position: "insideLeft" }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p className="font-medium">Length: {data.textLength} chars</p>
                              <p className="font-medium">Sentiment: {data.sentiment.toFixed(3)}</p>
                              <p className="text-sm text-gray-600">Post #{data.index + 1}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter dataKey="sentiment">
                      {correlationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.category)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Word Count vs Sentiment */}
            <div className="space-y-2">
              <h3 className="font-medium">Word Count vs Sentiment</h3>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart data={wordCountData}>
                    <XAxis
                      dataKey="wordCount"
                      type="number"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Word Count", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      dataKey="sentiment"
                      domain={[-1, 1]}
                      tick={{ fontSize: 12 }}
                      label={{ value: "Sentiment", angle: -90, position: "insideLeft" }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p className="font-medium">Words: {data.wordCount}</p>
                              <p className="font-medium">Sentiment: {data.sentiment.toFixed(3)}</p>
                              <p className="text-sm text-gray-600">Post #{data.index + 1}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter dataKey="sentiment">
                      {wordCountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.category)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
