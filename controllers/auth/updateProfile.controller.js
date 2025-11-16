const User = require("../../models/users");
const {
  normalizeName,
  sanitizeString,
} = require("../../utils/validators");

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user._id;

    // Normalize and sanitize input
    const normalizedFirstName = normalizeName(firstName || "");
    const normalizedLastName = normalizeName(lastName || "");

    // Validation
    if (!normalizedFirstName || !normalizedLastName) {
      return res.status(400).json({ 
        success: false,
        message: "First name and last name are required" 
      });
    }

    if (normalizedFirstName.length < 2 || normalizedLastName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "First and last name must be at least 2 characters",
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      },
      { new: true, runValidators: true }
    ).select("firstName lastName email accountType profilePicUrl _id");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        accountType: updatedUser.accountType,
        profilePicUrl: updatedUser.profilePicUrl,
      },
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { updateProfile };

