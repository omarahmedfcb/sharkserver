# Free AI APIs for Chatbot

## Overview
This document lists free AI APIs that can be used as alternatives to OpenAI when quota is exceeded.

## Free AI APIs Options

### 1. **Hugging Face Inference API**
- **Website:** https://huggingface.co/inference-api
- **Free Tier:** 
  - Free tier with rate limits
  - Good for testing and development
- **Models Available:**
  - Meta Llama 2
  - Mistral AI
  - Falcon
  - And many more open-source models
- **Setup:**
  - Sign up at https://huggingface.co
  - Get API token
  - Use their Inference API endpoint

### 2. **Groq API** (Fast & Free)
- **Website:** https://console.groq.com
- **Free Tier:**
  - Free tier with generous limits
  - Very fast inference
- **Models:**
  - Llama 2, Llama 3
  - Mixtral
- **Setup:**
  - Sign up at https://console.groq.com
  - Get API key
  - Similar to OpenAI API structure

### 3. **Together AI**
- **Website:** https://together.xyz
- **Free Tier:**
  - Free credits for new users
  - Pay-as-you-go pricing
- **Models:**
  - Open source models (Llama, Mistral, etc.)
  - Competitive pricing

### 4. **Anthropic Claude** (Free Tier Limited)
- **Website:** https://console.anthropic.com
- **Note:** Not completely free, but has free tier for testing
- **Better for:** Professional use cases

### 5. **Cohere API**
- **Website:** https://cohere.com
- **Free Tier:**
  - Limited free requests
  - Good for embeddings and chat

### 6. **Ollama** (Local, 100% Free)
- **Website:** https://ollama.ai
- **Free:** Completely free, runs locally
- **Setup:**
  - Install locally
  - Run models on your machine
  - No API costs, but requires local resources

## Recommended for This Project

### Option 1: Groq API (Best Balance)
- Fast and free
- Easy integration (similar to OpenAI)
- Good performance

### Option 2: Hugging Face (Most Flexible)
- Many models to choose from
- Good free tier
- Open source models

### Option 3: Use Database Only (Current)
- No API costs
- Relies on seeded FAQs
- Can add more Q&A pairs manually

## Integration Example (Groq)

```javascript
// Instead of OpenAI, use Groq
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const completion = await groq.chat.completions.create({
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userQuestion }
  ],
  model: "llama3-8b-8192", // or other Groq models
  temperature: 0.7,
  max_tokens: 500,
});
```

## Current Status
- AI is **disabled** in chatbot controller (`USE_AI = false`)
- System relies on **database only** (MongoDB FAQs)
- Can be enabled by setting `USE_AI = true` and adding a working API key

