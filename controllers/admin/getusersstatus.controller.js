const User = require("../../models/users");

const getUsersBanStatus = async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "User unauthorized to fetch data" });
    }
    const users = await User.find({}, "email");
    res.status(200).json({
      success: true,
      message: "Users ban status fetched successfully",
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getUsersBanStatus };
