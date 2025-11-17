const User = require("../../models/users");

const getAllUsers = async (req, res) => {
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
      accountType = "",
      banned = "",
      sortBy = "newest",
    } = req.query;

    // Build query
    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by account type
    if (accountType && ["investor", "owner", "admin"].includes(accountType)) {
      query.accountType = accountType;
    }

    // Filter by banned status
    if (banned !== "") {
      query.banned = banned === "true";
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
      case "name":
        sort = { firstName: 1, lastName: 1 };
        break;
      case "email":
        sort = { email: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const users = await User.find(query)
      .select("firstName lastName email accountType banned profilePicUrl createdAt")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getAllUsers };

