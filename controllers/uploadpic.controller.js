const User = require("../models/users");

const updateProfilePic = async (req, res) => {
  try {
    const { profilePicUrl } = req.body;
    if (!profilePicUrl)
      return res.status(400).json({ message: "No profilePicUrl provided" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicUrl },
      { new: true }
    );

    res.json({
      message: "Profile picture updated successfully",
      profilePicUrl: user.profilePicUrl,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateProfilePic };
