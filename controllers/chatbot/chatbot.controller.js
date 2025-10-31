const FAQ = require("../../models/faq");
const siteKnowledge = require("../../data/site-knowledge");

// Initialize AI client (Groq) only when needed (lazy initialization)
let groqClient = null;

function getAI() {
  if (!groqClient) {
    const Groq = require("groq-sdk");
    
    // Try Groq API key first (preferred)
    if (process.env.GROQ_API_KEY) {
      groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
      console.log("Using Groq API");
    }
    // Fallback to OpenAI if Groq not available
    else if (process.env.OPENAI_API_KEY) {
      const OpenAI = require("openai");
      groqClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("Using OpenAI API (fallback)");
    } else {
      throw new Error("No AI API key found. Please set GROQ_API_KEY or OPENAI_API_KEY in environment variables");
    }
  }
  return groqClient;
}

// Improved similarity matching function
function calculateSimilarity(question, storedQuestion) {
  const q1 = question.toLowerCase().trim().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
  const q2 = storedQuestion.toLowerCase().trim().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
  
  if (q1.length === 0 || q2.length === 0) return 0;
  
  // Remove common stop words
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'here', 'there'];
  const q1Filtered = q1.filter(w => !stopWords.includes(w));
  const q2Filtered = q2.filter(w => !stopWords.includes(w));
  
  // If filtered arrays are empty, use original
  const words1 = q1Filtered.length > 0 ? q1Filtered : q1;
  const words2 = q2Filtered.length > 0 ? q2Filtered : q2;
  
  // Calculate word overlap
  const commonWords = words1.filter(word => words2.includes(word));
  const allWords = new Set([...words1, ...words2]);
  
  // Also check for partial matches (e.g., "invest" matches "investment")
  let partialMatches = 0;
  for (const w1 of words1) {
    if (words2.some(w2 => w2.includes(w1) || w1.includes(w2))) {
      partialMatches++;
    }
  }
  
  const exactMatch = allWords.size > 0 ? commonWords.length / allWords.size : 0;
  const partialMatch = words1.length > 0 ? partialMatches / words1.length : 0;
  
  // Combine exact and partial matches
  return Math.max(exactMatch, partialMatch * 0.7);
}

// Search for similar questions in FAQ database
async function searchSimilarQuestions(userQuestion, language = "en") {
  try {
    const allFAQs = await FAQ.find({
      $or: [
        { language: language },
        { language: "both" }
      ]
    });

    let bestMatches = [];
    
    for (const faq of allFAQs) {
      const questionToCompare = language === "ar" && faq.questionAr 
        ? faq.questionAr 
        : faq.question;
      
      const similarity = calculateSimilarity(userQuestion, questionToCompare);
      
      // Also check keywords (improved matching)
      let keywordMatch = 0;
      if (faq.keywords && faq.keywords.length > 0) {
        const questionWords = userQuestion.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
        const matchedKeywords = faq.keywords.filter(kw => {
          const kwLower = kw.toLowerCase();
          return questionWords.some(word => 
            word.includes(kwLower) || kwLower.includes(word) || word === kwLower
          );
        });
        keywordMatch = matchedKeywords.length / faq.keywords.length;
      }
      
      const combinedScore = (similarity * 0.6) + (keywordMatch * 0.4);
      
      // Lower threshold for better matching
      if (combinedScore > 0.15 || similarity > 0.2 || keywordMatch > 0.3) { // Lower threshold
        bestMatches.push({
          faq,
          score: combinedScore,
          answer: language === "ar" && faq.answerAr ? faq.answerAr : faq.answer,
        });
      }
    }

    // Sort by score and return top 3
    bestMatches.sort((a, b) => b.score - a.score);
    return bestMatches.slice(0, 3);
  } catch (error) {
    console.error("Error searching FAQs:", error);
    return [];
  }
}

// Generate answer using AI
async function generateAIAnswer(userQuestion, language, conversationHistory = []) {
  try {
    console.log("Generating AI answer for question:", userQuestion);
    console.log("Language:", language);
    console.log("Groq API Key exists:", !!process.env.GROQ_API_KEY);
    console.log("OpenAI API Key exists:", !!process.env.OPENAI_API_KEY);
    
    const aiClient = getAI(); // Use lazy initialization (Groq or OpenAI)
    
    // Build system prompt with site knowledge
    const knowledgeBase = `
SharkStage Platform Information:
- Platform Name: ${siteKnowledge.platformName}
- Description: ${siteKnowledge.description}

Main Features:
${siteKnowledge.mainFeatures.map((f, i) => `${i + 1}. ${f.title}: ${f.description}`).join('\n')}

Investment Categories:
${siteKnowledge.investmentCategories.map((cat, i) => `${i + 1}. ${cat.title} (${cat.id}): ${cat.description} - ROI: ${cat.roi}`).join('\n')}

Platform Statistics:
- Projects Funded: ${siteKnowledge.platformStats.projectsFunded}
- Active Investors: ${siteKnowledge.platformStats.activeInvestors}
- Total Investments: ${siteKnowledge.platformStats.totalInvestments}

How to Use:
- Sign Up: ${siteKnowledge.howToUse.signUp.description}
- Sign In: ${siteKnowledge.howToUse.signIn.description}
- List Project: ${siteKnowledge.howToUse.listProject.description}
- Invest: ${siteKnowledge.howToUse.invest.description}

You are a helpful assistant for SharkStage platform. Answer questions about the platform, its features, investment categories, how to use the platform, and any other questions related to SharkStage. ${language === 'ar' ? 'Always respond in Arabic.' : 'Always respond in English.'}
`;

    const messages = [
      { role: "system", content: knowledgeBase },
      ...conversationHistory,
      { role: "user", content: userQuestion }
    ];

    // Use Groq if available, otherwise fallback to OpenAI
    const isGroq = !!process.env.GROQ_API_KEY;
    // Updated Groq model - using available models (try multiple options)
    // Common Groq models: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768
    const model = isGroq ? "llama-3.1-8b-instant" : "gpt-3.5-turbo"; // Groq model or OpenAI model
    
    const completion = await aiClient.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error generating AI answer:", error);
    throw error;
  }
}

// Main chatbot controller
const askChatbot = async (req, res) => {
  try {
    const { question, language = "en", conversationHistory = [] } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ message: "Question is required" });
    }

    // Step 1: Search for similar questions in FAQ database
    const similarQuestions = await searchSimilarQuestions(question, language);
    console.log(`Found ${similarQuestions.length} similar questions for: "${question}"`);
    if (similarQuestions.length > 0) {
      console.log("Top match score:", similarQuestions[0].score);
      console.log("Top match question:", similarQuestions[0].faq.question);
    }

    // Step 2: If we have a match, use the stored answer (lowered threshold for better database usage)
    // First check for very good matches (score > 0.5)
    if (similarQuestions.length > 0 && similarQuestions[0].score > 0.5) {
      const matchedFAQ = similarQuestions[0].faq;
      
      // Increment usage count
      await FAQ.findByIdAndUpdate(matchedFAQ._id, {
        $inc: { usageCount: 1 }
      });

      return res.status(200).json({
        success: true,
        answer: similarQuestions[0].answer,
        source: "database",
        matchedQuestion: language === "ar" && matchedFAQ.questionAr 
          ? matchedFAQ.questionAr 
          : matchedFAQ.question,
      });
    }

    // Step 3: Use database fallback for any match above threshold (lowered significantly)
    // Prioritize database over AI to avoid API costs
    if (similarQuestions.length > 0 && similarQuestions[0].score > 0.15) {
      console.log("Using database answer with score:", similarQuestions[0].score);
      const matchedFAQ = similarQuestions[0].faq;
      await FAQ.findByIdAndUpdate(matchedFAQ._id, {
        $inc: { usageCount: 1 }
      });
      
      return res.status(200).json({
        success: true,
        answer: similarQuestions[0].answer,
        source: "database",
        matchedQuestion: language === "ar" && matchedFAQ.questionAr 
          ? matchedFAQ.questionAr 
          : matchedFAQ.question,
      });
    }

    // Step 4: Try AI only if no database match and API is available
    // Enable AI when Groq or OpenAI API key is available
    const USE_AI = !!(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
    
    if (!USE_AI) {
      // Return helpful message suggesting user rephrase or use database
      const suggestionMessage = language === "ar"
        ? "عذراً، لم أتمكن من العثور على إجابة مناسبة في قاعدة البيانات. يمكنك إعادة صياغة السؤال أو تجربة الأسئلة التالية:\n\n" +
          (similarQuestions.length > 0 
            ? similarQuestions.map((q, i) => `${i + 1}. ${language === "ar" && q.faq.questionAr ? q.faq.questionAr : q.faq.question}`).join('\n')
            : "• ما هو SharkStage؟\n• كيف أسجل في المنصة؟\n• ما هي فئات الاستثمار المتاحة؟")
        : "Sorry, I couldn't find a suitable answer in the database. You can rephrase your question or try these:\n\n" +
          (similarQuestions.length > 0 
            ? similarQuestions.map((q, i) => `${i + 1}. ${q.faq.question}`).join('\n')
            : "• What is SharkStage?\n• How do I sign up?\n• What investment categories are available?");
      
      return res.status(200).json({
        success: true,
        answer: suggestionMessage,
        source: "database_suggestion",
      });
    }

    // AI generation (disabled for now)
    let aiAnswer;
    try {
      aiAnswer = await generateAIAnswer(question, language, conversationHistory);
    } catch (aiError) {
      // Log the actual error for debugging
      console.error("AI Error details:", aiError);
      console.error("AI Error message:", aiError.message);
      console.error("AI Error stack:", aiError.stack);
      
      // If AI fails, use the best match from FAQ if available
      if (similarQuestions.length > 0) {
        console.log("AI failed, using database fallback answer");
        const matchedFAQ = similarQuestions[0].faq;
        await FAQ.findByIdAndUpdate(matchedFAQ._id, {
          $inc: { usageCount: 1 }
        });
        
        return res.status(200).json({
          success: true,
          answer: similarQuestions[0].answer,
          source: "database_fallback",
        });
      }
      
      // If no database fallback and AI failed, suggest user rephrase
      const suggestionMessage = language === "ar"
        ? "عذراً، لم أتمكن من العثور على إجابة. يرجى إعادة صياغة السؤال أو تجربة سؤال مختلف."
        : "Sorry, I couldn't find an answer. Please rephrase your question or try a different one.";
      
      return res.status(200).json({ 
        success: true,
        answer: suggestionMessage,
        source: "suggestion",
      });
    }

    // Step 4: Save the new Q&A pair to database for future use
    // Only save if the question is substantial (more than 10 characters)
    if (question.length > 10 && aiAnswer.length > 20) {
      try {
        // Extract keywords from question
        const keywords = question.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 5);

        await FAQ.create({
          question: language === "ar" ? "" : question,
          questionAr: language === "ar" ? question : "",
          answer: language === "ar" ? "" : aiAnswer,
          answerAr: language === "ar" ? aiAnswer : "",
          category: "general",
          keywords: keywords,
          language: language === "ar" ? "ar" : "en",
          usageCount: 1,
        });
      } catch (saveError) {
        // Don't fail the request if saving fails
        console.error("Error saving FAQ:", saveError);
      }
    }

    res.status(200).json({
      success: true,
      answer: aiAnswer,
      source: "ai_generated",
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Server error. Please try again later.",
      answer: language === "ar"
        ? "عذراً، حدث خطأ في الخادم. يرجى المحاولة مرة أخرى."
        : "Sorry, a server error occurred. Please try again later.",
      error: error.message 
    });
  }
};

module.exports = { askChatbot };

