# AI Chatbot Implementation for SharkStage

## Overview
This implementation adds an AI-powered chatbot to the SharkStage platform that can answer questions about the website, its features, investment categories, and usage instructions.

## Features
- **RAG System (Retrieval Augmented Generation)**: Uses a Q&A database to provide accurate answers
- **AI Fallback**: If no matching answer is found in the database, uses OpenAI API to generate responses
- **Bilingual Support**: Supports both Arabic and English languages
- **Auto-learning**: New Q&A pairs are automatically saved to the database for future use
- **Usage Tracking**: Tracks how often each FAQ is used

## Setup Instructions

### 1. Install Dependencies
```bash
cd sharkserver
npm install
```

This will install the `openai` package along with other dependencies.

### 2. Environment Variables
Add the following to your `.env` file in the `sharkserver` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
MONGO_URL=your_mongodb_connection_string
DB_NAME=your_database_name
PORT=3000
```

To get an OpenAI API key:
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API keys section
4. Create a new API key
5. Copy and paste it to your `.env` file

### 3. Seed the FAQ Database
Run the seed script to populate the database with initial Q&A pairs:

```bash
npm run seed:faq
```

This will add pre-defined FAQs about:
- Platform overview
- Features and services
- How to use (Sign up, Login, Invest, List project)
- Investment categories
- Security information

### 4. Update CORS Settings
Make sure your CORS settings in `sharkserver/index.js` allow requests from your frontend URL:

```javascript
const corsOptions = {
  origin: "http://localhost:3001", // Update this to match your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
```

### 5. Frontend Environment Variables
Add to your `.env.local` file in the `sharkstage` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

### Chatbot
- **POST** `/chatbot/ask` - Ask a question to the chatbot
  - Body: `{ question: string, language: "en" | "ar", conversationHistory?: array }`
  - Response: `{ success: boolean, answer: string, source: "database" | "ai_generated" }`

### FAQ Management
- **POST** `/faq` - Create a new FAQ entry
- **GET** `/faq` - Get all FAQs (with optional query params: category, language, search)
- **GET** `/faq/:id` - Get a specific FAQ
- **PUT** `/faq/:id` - Update an FAQ
- **DELETE** `/faq/:id` - Delete an FAQ

## How It Works

### RAG Flow
1. User asks a question through the chatbot UI
2. System searches the FAQ database for similar questions
3. If a good match is found (similarity score > 0.6):
   - Returns the stored answer from the database
   - Increments the usage count
4. If no good match is found:
   - Generates an answer using OpenAI API
   - Saves the new Q&A pair to the database for future use
   - Returns the AI-generated answer

### Semantic Search
The system uses keyword matching and similarity scoring to find relevant FAQs:
- Compares question keywords
- Calculates word overlap similarity
- Combines scores for better matching

## Frontend Component
The chatbot is implemented as a React component (`sharkstage/app/components/Chatbot.jsx`) that:
- Shows as a floating button in the bottom-right corner
- Opens a chat window when clicked
- Supports language switching (Arabic/English)
- Maintains conversation history
- Has loading states and error handling

## Database Schema
FAQ model includes:
- `question` / `questionAr` - Question in English/Arabic
- `answer` / `answerAr` - Answer in English/Arabic
- `category` - FAQ category (general, features, projects, etc.)
- `keywords` - Array of keywords for searching
- `language` - Language (ar, en, both)
- `usageCount` - How many times this FAQ has been used
- `createdAt` / `updatedAt` - Timestamps

## Troubleshooting

### Chatbot not responding
1. Check that OpenAI API key is set correctly in `.env`
2. Verify the backend server is running
3. Check browser console for errors
4. Verify CORS settings allow requests from frontend

### Database connection issues
1. Verify MongoDB connection string in `.env`
2. Check that database name is correct
3. Ensure MongoDB server is accessible

### Seed script not working
1. Make sure MongoDB is connected
2. Check that `.env` file has correct MONGO_URL and DB_NAME
3. If FAQs already exist, the script will skip (to avoid duplicates)

## Future Enhancements
- Admin panel for managing FAQs
- Advanced semantic search using embeddings
- Analytics dashboard for chatbot usage
- Multi-turn conversation improvements
- Integration with user authentication for personalized responses

