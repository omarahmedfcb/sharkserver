const FAQ = require("../../models/faq");

const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question,
      questionAr,
      answer,
      answerAr,
      category,
      keywords,
      language,
    } = req.body;

    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      {
        question: question || faq.question,
        questionAr: questionAr !== undefined ? questionAr : faq.questionAr,
        answer: answer || faq.answer,
        answerAr: answerAr !== undefined ? answerAr : faq.answerAr,
        category: category || faq.category,
        keywords: keywords || faq.keywords,
        language: language || faq.language,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      data: updatedFAQ,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateFAQ };

