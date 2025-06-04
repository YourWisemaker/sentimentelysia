"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts"
import type { SentimentResult } from "@/lib/sentiment-analyzer"
import { TrendingUp } from "lucide-react"

interface SentimentPolarityChartProps {
  data: SentimentResult[]
}

export function SentimentPolarityChart({ data }: SentimentPolarityChartProps) {
  // Create polarity distribution data
  const polarityData = [
    {
      range: "Very Negative",
      count: data.filter((d) => d.score <= -0.5).length,
      color: "#ef4444",
    },
    {
      range: "Negative",
      count: data.filter((d) => d.score > -0.5 && d.score <= -0.1).length,
      color: "#f97316",
    },
    {
      range: "Neutral",
      count: data.filter((d) => d.score > -0.1 && d.score <= 0.1).length,
      color: "#eab308",
    },
    {
      range: "Positive",
      count: data.filter((d) => d.score > 0.1 && d.score <= 0.5).length,
      color: "#22c55e",
    },
    {
      range: "Very Positive",
      count: data.filter((d) => d.score > 0.5).length,
      color: "#16a34a",
    },
  ]

  // Create scatter plot data
  const scatterData = data.map((item, index) => ({
    x: index,
    y: item.score,
    sentiment: item.score > 0.1 ? "positive" : item.score < -0.1 ? "negative" : "neutral",
  }))

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sentiment Polarity Distribution
          </CardTitle>
          <CardDescription>Distribution of sentiment scores across different polarity ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={polarityData}>
                <XAxis dataKey="range" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {polarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sentiment Score Timeline</CardTitle>
          <CardDescription>Individual sentiment scores plotted over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <XAxis dataKey="x" type="number" domain={[0, data.length - 1]} tick={{ fontSize: 12 }} />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">Score: {data.y.toFixed(3)}</p>
                          <p className="text-sm text-gray-600">Post #{data.x + 1}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter
                  dataKey="y"
                  fill={(entry) => {
                    const sentiment = entry.sentiment
                    return sentiment === "positive" ? "#22c55e" : sentiment === "negative" ? "#ef4444" : "#eab308"
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
