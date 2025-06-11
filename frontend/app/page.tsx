"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { CsvUploader } from "@/components/csv-uploader"

export default function SentimentAnalysisDashboard() {
  const [tweets, setTweets] = useState<string[]>([])
  const [newTweet, setNewTweet] = useState("")
  const [sentimentData, setSentimentData] = useState<SentimentResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [fileUploadError, setFileUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isFromFileUpload, setIsFromFileUpload] = useState(false)

  useEffect(() => {
    // Only analyze tweets if they weren't added from file upload
    if (!isFromFileUpload && tweets.length > 0) {
      analyzeTweets()
    }
  }, [tweets, isFromFileUpload])

  // Separate useEffect to reset the flag after a delay
  useEffect(() => {
    if (isFromFileUpload) {
      const timer = setTimeout(() => {
        setIsFromFileUpload(false)
      }, 100) // Small delay to ensure state updates are processed
      return () => clearTimeout(timer)
    }
  }, [isFromFileUpload])

  const analyzeTweets = async () => {
    setIsAnalyzing(true)
    const results = await Promise.all(tweets.map((tweet: string) => analyzeSentiment(tweet)))
    setSentimentData(results)
    setIsAnalyzing(false)
  }

  const addTweet = () => {
    if (newTweet.trim()) {
      setIsFromFileUpload(false) // Ensure manual tweets trigger analysis
      setTweets([...tweets, newTweet.trim()])
      setNewTweet("")
    }
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
            <h1 className="text-4xl font-bold text-gray-900">Twitter Sentiment Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze sentiment patterns in twitter content with AI-powered insights and comprehensive visualizations
          </p>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Content for Analysis
            </CardTitle>
            <CardDescription>Upload a CSV file with content to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <CsvUploader 
                onUploadSuccess={(results) => {
                  if (results.length === 0) {
                    setFileUploadError("No valid content found in the file");
                    return;
                  }
                  
                  const extractedTexts = results.map((result: SentimentResult) => result.text);
                  setIsFromFileUpload(true);
                  setTweets(extractedTexts); // Replace instead of append
                  setSentimentData(results); // Replace instead of append
                  setFileUploadError(null);
                }}
                onUploadError={(error) => setFileUploadError(error)}
              />
            </div>
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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wordcloud-all">Word Cloud</TabsTrigger>
            <TabsTrigger value="wordcloud-positive">Positive Words</TabsTrigger>
            <TabsTrigger value="wordcloud-negative">Negative Words</TabsTrigger>
            <TabsTrigger value="polarity">Polarity</TabsTrigger>
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="phrases">Top Phrases</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SentimentPolarityChart data={sentimentData} />
              <SentimentScoreDistribution data={sentimentData} />
              <TopPhrasesCard data={sentimentData} />
              <WordCloud 
                data={sentimentData} 
                sentimentFilter="all" 
                title="Mixed Word Cloud" 
                description="Most frequently used words across all sentiment categories" 
              />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <SentimentByCategory data={sentimentData} />
            </div>
          </TabsContent>

          <TabsContent value="wordcloud-all">
            <WordCloud 
              data={sentimentData} 
              sentimentFilter="all" 
              title="Mixed Word Cloud" 
              description="Most frequently used words across all sentiment categories" 
            />
          </TabsContent>

          <TabsContent value="wordcloud-positive">
            <WordCloud 
              data={sentimentData} 
              sentimentFilter="positive" 
              title="Positive Word Cloud" 
              description="Most frequently used words in positive sentiment content" 
            />
          </TabsContent>

          <TabsContent value="wordcloud-negative">
            <WordCloud 
              data={sentimentData} 
              sentimentFilter="negative" 
              title="Negative Word Cloud" 
              description="Most frequently used words in negative sentiment content" 
            />
          </TabsContent>

          <TabsContent value="polarity">
            <SentimentPolarityChart data={sentimentData} />
          </TabsContent>

          <TabsContent value="category">
            <SentimentByCategory data={sentimentData} />
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
