const User = require("../../models/users");

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.accountType !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "User unauthorized to ban" });
    }
    await User.findByIdAndUpdate(id, { banned: true });
    res.status(200).json({
      success: true,
      message: "User banned successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { banUser };
