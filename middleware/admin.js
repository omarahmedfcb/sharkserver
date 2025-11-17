const requireAdmin = async (req, res, next) => {
  try {
    // يجب أن يكون المستخدم مسجل دخول أولاً
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // التحقق من أن المستخدم admin
    if (req.user.accountType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // التحقق من أن المستخدم غير محظور
    if (req.user.banned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { requireAdmin };

