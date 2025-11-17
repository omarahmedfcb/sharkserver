const FAQ = require("../../models/faq");

const getAllFAQs = async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const {
      page = 1,
      limit = 20,
      search = "",
      category = "",
      sortBy = "newest",
    } = req.query;

    // Build query
    const query = {};

    // Search by question or answer
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { questionAr: { $regex: search, $options: "i" } },
        { answerAr: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "usage":
        sort = { usageCount: -1 };
        break;
      case "category":
        sort = { category: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get FAQs
    const faqs = await FAQ.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await FAQ.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        faqs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getAllFAQs };

