"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { SentimentResult } from "@/lib/sentiment-analyzer"
import { BarChart3 } from "lucide-react"

interface SentimentScoreDistributionProps {
  data: SentimentResult[]
}

export function SentimentScoreDistribution({ data }: SentimentScoreDistributionProps) {
  // Create histogram data
  const createHistogram = (scores: number[], bins = 20) => {
    if (scores.length === 0) {
      return []
    }

    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const binSize = (max - min) / bins

    const histogram = Array.from({ length: bins }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(2)} to ${(min + (i + 1) * binSize).toFixed(2)}`,
      rangeStart: min + i * binSize,
      rangeEnd: min + (i + 1) * binSize,
      count: 0,
      midpoint: min + (i + 0.5) * binSize,
    }))

    scores.forEach((score) => {
      const binIndex = Math.min(Math.floor((score - min) / binSize), bins - 1)
      if (binIndex >= 0 && binIndex < histogram.length) {
        histogram[binIndex].count++
      }
    })

    return histogram
  }

  const scores = data.map((d) => d.score).filter((score) => typeof score === "number" && !isNaN(score))

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sentiment Score Distribution
          </CardTitle>
          <CardDescription>Statistical distribution of sentiment scores across all analyzed content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No sentiment data available for analysis
          </div>
        </CardContent>
      </Card>
    )
  }

  const histogramData = createHistogram(scores, 15)

  // Calculate statistics
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const sortedScores = [...scores].sort((a, b) => a - b)
  const median =
    sortedScores.length % 2 === 0
      ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
      : sortedScores[Math.floor(sortedScores.length / 2)]

  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)

  // Create cumulative distribution
  const cumulativeData = histogramData.map((bin, index) => ({
    ...bin,
    cumulative: histogramData.slice(0, index + 1).reduce((sum, b) => sum + b.count, 0),
  }))

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
    cumulative: {
      label: "Cumulative",
      color: "hsl(var(--chart-2))",
    },
  }

  // Safe tick formatter function
  const formatTick = (value: any) => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toFixed(2)
    }
    return String(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Sentiment Score Distribution
        </CardTitle>
        <CardDescription>Statistical distribution of sentiment scores across all analyzed content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Mean</p>
            <p className="text-lg font-semibold">{mean.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Median</p>
            <p className="text-lg font-semibold">{median.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Std Dev</p>
            <p className="text-lg font-semibold">{standardDeviation.toFixed(3)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Sample Size</p>
            <p className="text-lg font-semibold">{scores.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Histogram */}
          <div className="space-y-2">
            <h3 className="font-medium">Score Distribution Histogram</h3>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={histogramData}>
                  <XAxis
                    dataKey="midpoint"
                    type="number"
                    scale="linear"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fontSize: 10 }}
                    tickFormatter={formatTick}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">Range: {data.range}</p>
                            <p className="text-sm">Count: {data.count}</p>
                            <p className="text-sm">Frequency: {((data.count / scores.length) * 100).toFixed(1)}%</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Cumulative Distribution */}
          <div className="space-y-2">
            <h3 className="font-medium">Cumulative Distribution</h3>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cumulativeData}>
                  <XAxis
                    dataKey="midpoint"
                    type="number"
                    scale="linear"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fontSize: 10 }}
                    tickFormatter={formatTick}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">Score: {data.midpoint.toFixed(3)}</p>
                            <p className="text-sm">Cumulative Count: {data.cumulative}</p>
                            <p className="text-sm">
                              Percentile: {((data.cumulative / scores.length) * 100).toFixed(1)}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
