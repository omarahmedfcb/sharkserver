const { Notification } = require("../../models/notifications");

const setAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not authorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { setAsRead };
