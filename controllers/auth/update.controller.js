// controllers/user/updateProfile.controller.js
const User = require("../../models/users");

const updateProfile = async (req, res) => {
  try {
    console.log("=== updateProfile called ===");
    console.log("req.user:", req.user); // should contain user id
    console.log("req.body keys:", Object.keys(req.body || {}));
    console.log("req.file:", !!req.file);

    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: missing user id" });
    }

    // Build update object only with provided fields
    const updates = {};
    const allowed = ["firstName", "lastName", "email", "phone"];
    allowed.forEach((k) => {
      if (
        req.body &&
        typeof req.body[k] !== "undefined" &&
        req.body[k] !== ""
      ) {
        updates[k] = req.body[k].trim ? req.body[k].trim() : req.body[k];
      }
    });

    // If file uploaded (via multer), set profilePicUrl
    if (req.file) {
      updates.profilePicUrl = `/uploads/${req.file.filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No fields to update" });
    }

    // Use findByIdAndUpdate so we don't have to fetch/save manually
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password"); // don't return password

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("✅ updateProfile success:", updatedUser._id);
    return res
      .status(200)
      .json({ success: true, message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("❌ updateProfile error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

module.exports = { updateProfile };
