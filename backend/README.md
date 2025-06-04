# SentimentElysia Backend

A sentiment analysis backend service built with Elysia.js, LangChain, and OpenRouter's Gemini Flash model.

## Features

- Sentiment analysis of text using OpenRouter's Gemini Flash model
- File processing support for CSV, TXT, and JSON formats
- RESTful API with Swagger documentation
- CORS support for frontend integration

## Prerequisites

- [Bun](https://bun.sh/) runtime
- OpenRouter API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Create a `.env` file based on `.env.example` and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## Running the Server

### Development Mode

```bash
bun run dev
```

This will start the server in development mode with hot reloading.

### Production Mode

```bash
bun run start
```

## API Endpoints

### Analyze Text

```
POST /api/analyze
```

Request body:
```json
{
  "text": "Your text to analyze"
}
```

### Analyze File

```
POST /api/analyze-file
```

Request body:
```json
{
  "fileContent": "base64-encoded-file-content",
  "fileType": "csv" // or "txt", "json"
}
```

## Swagger Documentation

Swagger documentation is available at `/swagger` when the server is running.