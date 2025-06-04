"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WordCloud } from "@/components/word-cloud"
import { SentimentPolarityChart } from "@/components/sentiment-polarity-chart"
import { TopPhrasesCard } from "@/components/top-phrases-card"
import { SentimentCorrelationMap } from "@/components/sentiment-correlation-map"
import { SentimentByCategory } from "@/components/sentiment-by-category"
import { SentimentScoreDistribution } from "@/components/sentiment-score-distribution"
import { analyzeSentiment, analyzeSentimentFromFile, SentimentResult } from "@/lib/sentiment-analyzer"
import { sampleTweets } from "@/lib/sample-data"
import { Twitter, TrendingUp, Hash, Upload, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { parseCSV } from "@/lib/file-parser"

export default function SentimentAnalysisDashboard() {
  const [tweets, setTweets] = useState<string[]>(sampleTweets)
  const [newTweet, setNewTweet] = useState("")
  const [sentimentData, setSentimentData] = useState<SentimentResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [fileUploadError, setFileUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    analyzeTweets()
  }, [tweets])

  const analyzeTweets = async () => {
    setIsAnalyzing(true)
    const results = await Promise.all(tweets.map((tweet: string) => analyzeSentiment(tweet)))
    setSentimentData(results)
    setIsAnalyzing(false)
  }

  const addTweet = () => {
    if (newTweet.trim()) {
      setTweets([...tweets, newTweet.trim()])
      setNewTweet("")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setFileUploadError(null)

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
      
      if (['csv', 'txt', 'json'].includes(fileExt)) {
        // Use the backend API to analyze the file directly
        const results = await analyzeSentimentFromFile(file)
        
        if (results.length === 0) {
          throw new Error(`No valid content found in the ${fileExt.toUpperCase()} file`)
        }
        
        // Extract the text from results to add to tweets list
        const extractedTexts = results.map((result: SentimentResult) => result.text)
        setTweets((prev: string[]) => [...prev, ...extractedTexts])
        
        // Update sentiment data directly
        setSentimentData((prev: SentimentResult[]) => [...prev, ...results])
      } else {
        throw new Error(`Unsupported file format: ${fileExt}. Please upload a CSV, TXT, or JSON file.`)
      }
    } catch (error) {
      setFileUploadError(error instanceof Error ? error.message : "Failed to process file")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const overallSentiment =
    sentimentData.length > 0 ? sentimentData.reduce((sum: number, data: SentimentResult) => sum + data.score, 0) / sentimentData.length : 0

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return "text-green-600"
    if (score < -0.1) return "text-red-600"
    return "text-yellow-600"
  }

  const getSentimentLabel = (score: number) => {
    if (score > 0.1) return "Positive"
    if (score < -0.1) return "Negative"
    return "Neutral"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Twitter className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-900">Social Media Sentiment Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze sentiment patterns in social media content with AI-powered insights and comprehensive visualizations
          </p>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Content for Analysis
            </CardTitle>
            <CardDescription>Upload a CSV, TXT, or JSON file with content to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-white/50">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600 text-center">Upload a file with content to analyze</p>
              <p className="text-xs text-gray-500 text-center">Supported formats: CSV, TXT, JSON</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.txt,.json" className="hidden" />
              <Button variant="outline" onClick={triggerFileUpload} disabled={isUploading} className="mt-2">
                {isUploading ? "Analyzing..." : "Select File"}
              </Button>
            </div>

            {fileUploadError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{fileUploadError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Overall Sentiment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Analyzed {sentimentData.length} posts</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{overallSentiment.toFixed(3)}</span>
                  <Badge className={`${getSentimentColor(overallSentiment)} border border-current`}>
                    {getSentimentLabel(overallSentiment)}
                  </Badge>
                </div>
              </div>
              {isAnalyzing && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>}
            </div>
          </CardContent>
        </Card>

        {/* Visualization Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wordcloud">Word Cloud</TabsTrigger>
            <TabsTrigger value="polarity">Polarity</TabsTrigger>
            <TabsTrigger value="phrases">Top Phrases</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SentimentPolarityChart data={sentimentData} />
              <SentimentScoreDistribution data={sentimentData} />
              <SentimentByCategory data={sentimentData} />
              <TopPhrasesCard data={sentimentData} />
            </div>
          </TabsContent>

          <TabsContent value="wordcloud">
            <WordCloud data={sentimentData} />
          </TabsContent>

          <TabsContent value="polarity">
            <SentimentPolarityChart data={sentimentData} />
          </TabsContent>

          <TabsContent value="phrases">
            <TopPhrasesCard data={sentimentData} />
          </TabsContent>

          <TabsContent value="correlation">
            <SentimentCorrelationMap data={sentimentData} />
          </TabsContent>

          <TabsContent value="distribution">
            <SentimentScoreDistribution data={sentimentData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
