const FAQ = require("../../models/faq");

const addFAQ = async (req, res) => {
  try {
    const {
      question,
      questionAr,
      answer,
      answerAr,
      category,
      keywords,
      language,
    } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: "Question and answer are required" });
    }

    const newFAQ = await FAQ.create({
      question,
      questionAr: questionAr || "",
      answer,
      answerAr: answerAr || "",
      category: category || "general",
      keywords: keywords || [],
      language: language || "both",
    });

    res.status(201).json({
      success: true,
      message: "FAQ added successfully",
      data: newFAQ,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addFAQ };

