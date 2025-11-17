const { Project } = require("../../models/projects");

const getAllProjects = async (req, res) => {
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
      status = "",
      category = "",
      sortBy = "newest",
    } = req.query;

    // Build query
    const query = {};

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Filter by status
    if (status && ["active", "closed"].includes(status)) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.$or = [
        { "category.en": category },
        { "category.ar": category },
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
      case "funding":
        sort = { totalPrice: -1 };
        break;
      case "progress":
        sort = { progress: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get projects
    const projects = await Project.find(query)
      .populate("owner", "firstName lastName email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getAllProjects };

