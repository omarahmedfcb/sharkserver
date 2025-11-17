const Post = require("../../models/posts");

const getAllBlogs = async (req, res) => {
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
      sortBy = "newest",
    } = req.query;

    // Build query
    const query = {};

    // Search by title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
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
      case "title":
        sort = { title: 1 };
        break;
      case "comments":
        sort = { commentsCount: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get posts
    const posts = await Post.find(query)
      .populate("author", "firstName lastName email profilePicUrl")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getAllBlogs };

