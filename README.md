# Sentiment Analysis Dashboard

> "Love is the only reality and it is not a mere sentiment. It is the ultimate truth that lies at the heart of creation." - Rabindranath Tagore

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Elysia.js](https://img.shields.io/badge/Elysia.js-5A29E4?style=for-the-badge&logo=elysia&logoColor=white)](https://elysiajs.com/)
[![LangChain](https://img.shields.io/badge/LangChain-3178C6?style=for-the-badge&logo=chainlink&logoColor=white)](https://js.langchain.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A comprehensive AI-powered sentiment analysis dashboard built with Next.js, Elysia.js, and LangChain.js. Analyze sentiment in text and files with advanced visualizations and insights using OpenRouter's Gemini Flash model.

## Project Structure

```
├── backend/         # Elysia.js backend with LangChain integration
└── frontend/        # Next.js frontend application
```

## Features

### 📊 Comprehensive Analytics
- **CSV File Support**: Analyze sentiment in CSV files with automatic text column detection
- **Real-time Processing**: Instant sentiment analysis with AI-powered insights
- **Interactive Dashboard**: Overview section with key metrics and visualizations

### 📈 Advanced Visualizations
- **Sentiment Polarity Chart**: Scatter plot showing sentiment distribution
- **Score Distribution**: Histogram of sentiment scores across your data
- **Category Analysis**: Sentiment breakdown by custom categories
- **Word Clouds**: Visual representation of sentiment-based word frequency
  - Mixed sentiment word cloud (overview)
  - Separate clouds for positive, negative, and mixed sentiments
- **Top Phrases**: Most frequent phrases with sentiment context
- **Correlation Maps**: Relationship analysis between different sentiment aspects

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Tabbed Navigation**: Organized content with intuitive tab-based interface
- **Conditional Rendering**: Components appear only when relevant data is available

### 🔧 Technical Features
- **Backend API**: Powered by Elysia.js and LangChain.js
- **AI Integration**: OpenRouter's Gemini Flash model for accurate sentiment analysis
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Performance Optimized**: Efficient data processing and visualization rendering

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) for the backend
- [pnpm](https://pnpm.io/) for the frontend (or npm/yarn)
- OpenRouter API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file based on `.env.example` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. Start the development server:
   ```bash
   bun run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file (already done if you followed the setup):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Getting Started
1. **Upload Data**: Use the CSV uploader to import your data file
   - Supported format: CSV files only
   - The system will automatically detect text columns (content, text, tweet, post, message)

2. **Overview Dashboard**: Once data is uploaded, the overview section displays:
   - Overall sentiment summary
   - Mixed word cloud with top sentiment-bearing words
   - Key metrics and insights

3. **Explore Visualizations**: Navigate through different tabs to access:
   - **Sentiment Polarity**: Scatter plot of sentiment vs. polarity
   - **Score Distribution**: Histogram showing sentiment score patterns
   - **By Category**: Sentiment analysis grouped by categories
   - **Top Phrases**: Most frequent phrases with sentiment context
   - **Word Cloud**: Interactive word clouds with sentiment filtering
   - **Correlation Map**: Advanced correlation analysis

### Data Format Requirements
- **CSV Files**: Should contain a text column with content to analyze
  - Supported column names: content, text, tweet, post, message
  - If no specific column is found, the system will use the 3rd column (typical tweet format)
  - Headers are automatically detected and skipped

### Tips for Best Results
- Ensure your data contains meaningful text content
- Larger datasets provide more comprehensive visualizations
- Use the category features to segment your analysis by relevant groupings

## License

MIT