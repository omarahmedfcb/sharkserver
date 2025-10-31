# Groq API Integration

## Setup Instructions

### 1. Install Groq SDK
```bash
cd sharkserver
npm install
```

This will install `groq-sdk` package.

### 2. Add Groq API Key to `.env`
Add the following to your `.env` file in the `sharkserver` directory:

```env
  GROQ_API_KEY=your_groq_api_key_here
```

### 3. Restart Backend
After adding the API key, restart your backend server:

```bash
npm run dev
```

## How It Works

The system now uses Groq API (fast and free) as the primary AI provider:

1. **Priority Order:**
   - First tries to use Groq API (if `GROQ_API_KEY` is set)
   - Falls back to OpenAI (if `OPENAI_API_KEY` is set and Groq is not available)
   - If neither is available, uses database-only mode

2. **Model Used:**
   - Groq: `llama3-8b-8192` (fast and efficient)
   - OpenAI: `gpt-3.5-turbo` (fallback)

3. **Database First:**
   - System always checks database first for answers
   - Only uses AI if no good database match is found
   - Threshold: score > 0.35 for database matches

## Features

- ✅ Fast responses (Groq is very fast)
- ✅ Free tier available
- ✅ Works with both Arabic and English
- ✅ Database fallback always available
- ✅ Automatic answer saving to database

## Testing

After setup, test the chatbot by asking questions:
- "What is SharkStage?"
- "How do I sign up?"
- "What are the investment categories?"

The system will:
1. Try to find answer in database first
2. If not found, use Groq AI to generate answer
3. Save new Q&A pairs to database for future use

## Troubleshooting

If you see errors:
1. Check that `GROQ_API_KEY` is set in `.env`
2. Restart the backend server after adding the key
3. Check backend console for any error messages
4. Verify that Groq SDK is installed: `npm list groq-sdk`

