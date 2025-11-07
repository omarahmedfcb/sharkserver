const { Notification } = require("../../models/notifications");

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const userNotifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      userNotifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getUserNotifications };
