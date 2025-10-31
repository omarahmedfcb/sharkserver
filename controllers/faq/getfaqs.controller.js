const FAQ = require("../../models/faq");

const getFAQs = async (req, res) => {
  try {
    const { category, language, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (language && language !== "both") {
      query.language = { $in: [language, "both"] };
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const faqs = await FAQ.find(query).sort({ usageCount: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({
      success: true,
      data: faq,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getFAQs, getFAQById };

