# SentimentElysia - Sentiment Analysis Platform

> "Love is the only reality and it is not a mere sentiment. It is the ultimate truth that lies at the heart of creation." - Rabindranath Tagore

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Elysia.js](https://img.shields.io/badge/Elysia.js-5A29E4?style=for-the-badge&logo=elysia&logoColor=white)](https://elysiajs.com/)
[![LangChain](https://img.shields.io/badge/LangChain-3178C6?style=for-the-badge&logo=chainlink&logoColor=white)](https://js.langchain.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A full-stack sentiment analysis application built with Next.js, Elysia.js, and LangChain.js. The application analyzes sentiment in text and files using OpenRouter's Gemini Flash model.

## Project Structure

```
├── backend/         # Elysia.js backend with LangChain integration
└── frontend/        # Next.js frontend application
```

## Features

- Analyze sentiment in text and files (CSV, TXT, JSON)
- Visualize sentiment analysis results with interactive charts
- Backend API powered by Elysia.js and LangChain.js
- AI-powered sentiment analysis using OpenRouter's Gemini Flash model
- Responsive UI built with Next.js and Tailwind CSS

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

1. Enter text in the input field or upload a file (CSV, TXT, JSON)
2. The application will analyze the sentiment and display the results
3. Explore different visualizations through the tabs

## License

MIT