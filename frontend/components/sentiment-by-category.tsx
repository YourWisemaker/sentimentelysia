"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts"
import type { SentimentResult } from "@/lib/sentiment-analyzer"
import { Tags } from "lucide-react"

interface SentimentByCategoryProps {
  data: SentimentResult[]
}

export function SentimentByCategory({ data }: SentimentByCategoryProps) {
  // Return nothing if no data
  if (!data || data.length === 0) {
    return null
  }

  // Categorize content based on keywords and sentiment
  const categorizeContent = (text: string, sentiment: number) => {
    if (!text) return "General"
    const lowerText = text.toLowerCase()

    if (
      lowerText.includes("product") ||
      lowerText.includes("service") ||
      lowerText.includes("buy") ||
      lowerText.includes("purchase")
    ) {
      return "Product/Service"
    }
    if (lowerText.includes("support") || lowerText.includes("help") || lowerText.includes("customer")) {
      return "Customer Support"
    }
    if (lowerText.includes("news") || lowerText.includes("update") || lowerText.includes("announcement")) {
      return "News/Updates"
    }
    if (lowerText.includes("feature") || lowerText.includes("new") || lowerText.includes("release")) {
      return "Features"
    }
    if (lowerText.includes("bug") || lowerText.includes("issue") || lowerText.includes("problem")) {
      return "Issues/Bugs"
    }
    if (
      lowerText.includes("thank") ||
      lowerText.includes("great") ||
      lowerText.includes("awesome") ||
      lowerText.includes("love")
    ) {
      return "Appreciation"
    }
    return "General"
  }

  // Group data by category
  const categoryData: Record<
    string,
    { positive: number; negative: number; neutral: number; total: number; avgSentiment: number }
  > = {}

  data.forEach((item) => {
    const category = categorizeContent(item.text, item.score)

    if (!categoryData[category]) {
      categoryData[category] = { positive: 0, negative: 0, neutral: 0, total: 0, avgSentiment: 0 }
    }

    if (item.score > 0.1) {
      categoryData[category].positive++
    } else if (item.score < -0.1) {
      categoryData[category].negative++
    } else {
      categoryData[category].neutral++
    }

    categoryData[category].total++
    categoryData[category].avgSentiment += item.score
  })

  // Calculate average sentiment for each category
  Object.keys(categoryData).forEach((category) => {
    categoryData[category].avgSentiment /= categoryData[category].total
  })

  // Prepare data for charts
  const pieData = Object.entries(categoryData).map(([category, data]) => ({
    name: category,
    value: data.total,
    positive: data.positive,
    negative: data.negative,
    neutral: data.neutral,
  }))

  const barData = Object.entries(categoryData).map(([category, data]) => ({
    category: category.length > 10 ? category.substring(0, 10) + "..." : category,
    fullCategory: category,
    positive: data.positive,
    negative: data.negative,
    neutral: data.neutral,
    avgSentiment: data.avgSentiment,
  }))

  const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316"]

  const chartConfig = {
    positive: {
      label: "Positive",
      color: "#22c55e",
    },
    negative: {
      label: "Negative",
      color: "#ef4444",
    },
    neutral: {
      label: "Neutral",
      color: "#eab308",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Sentiment by Category
        </CardTitle>
        <CardDescription>Sentiment analysis grouped by content categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution Pie Chart */}
          <div className="space-y-2">
            <h3 className="font-medium">Category Distribution</h3>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}-${entry.name}-${entry.value}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">Total: {data.value}</p>
                            <p className="text-sm text-green-600">Positive: {data.positive}</p>
                            <p className="text-sm text-red-600">Negative: {data.negative}</p>
                            <p className="text-sm text-yellow-600">Neutral: {data.neutral}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Sentiment by Category Bar Chart */}
          <div className="space-y-2">
            <h3 className="font-medium">Sentiment Breakdown by Category</h3>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = barData.find((d) => d.category === label)
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data?.fullCategory}</p>
                            <p className="text-sm text-green-600">Positive: {payload[0]?.value}</p>
                            <p className="text-sm text-red-600">Negative: {payload[1]?.value}</p>
                            <p className="text-sm text-yellow-600">Neutral: {payload[2]?.value}</p>
                            <p className="text-sm">Avg Sentiment: {data?.avgSentiment.toFixed(3)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="positive" stackId="a" fill="#22c55e" />
                  <Bar dataKey="negative" stackId="a" fill="#ef4444" />
                  <Bar dataKey="neutral" stackId="a" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
