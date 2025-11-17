const User = require("../../models/users");

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.accountType !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "User unauthorized to unban" });
    }
    await User.findByIdAndUpdate(id, { banned: false });
    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { unbanUser };
