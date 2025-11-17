const User = require("../../models/users");

const updateUser = async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;
    const { accountType, banned, firstName, lastName } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from changing their own account type or ban status
    if (user._id.toString() === req.user._id.toString()) {
      if (accountType && accountType !== "admin") {
        return res.status(400).json({
          success: false,
          message: "You cannot change your own account type",
        });
      }
      if (banned !== undefined && banned === true) {
        return res.status(400).json({
          success: false,
          message: "You cannot ban yourself",
        });
      }
    }

    // Update fields
    const updateData = {};
    if (accountType && ["investor", "owner", "admin"].includes(accountType)) {
      updateData.accountType = accountType;
    }
    if (banned !== undefined) {
      updateData.banned = banned;
    }
    if (firstName) {
      updateData.firstName = firstName;
    }
    if (lastName) {
      updateData.lastName = lastName;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("firstName lastName email accountType banned profilePicUrl createdAt");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { updateUser };

