const Comment = require("../../models/comments");
const { Notification } = require("../../models/notifications");

const likeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate("author", "_id");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if already liked
    if (comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You already liked this comment",
      });
    }

    comment.likes.push(userId);
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment liked successfully",
      likesCount: comment.likes.length,
    });

    // Create notification
    if (comment.author._id.toString() !== userId.toString()) {
      Notification.create({
        user: comment.author._id,
        message: `${req.user.firstName} ${req.user.lastName} liked your comment`,
        link: `/blog/${comment.post}#${comment._id}`,
        type: "like",
      }).catch((err) => console.error("Notification creation failed:", err));
    }
  } catch (error) {
    console.error("Error liking comment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const unlikeComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if not liked
    if (!comment.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this comment",
      });
    }

    comment.likes = comment.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment unliked successfully",
      likesCount: comment.likes.length,
    });
  } catch (error) {
    console.error("Error unliking comment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { likeComment, unlikeComment };
