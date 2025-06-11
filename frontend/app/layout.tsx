import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sentiment Analysis Dashboard',
  description: 'AI-powered sentiment analysis tool for analyzing emotions and opinions in text content with comprehensive visualizations and insights',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
