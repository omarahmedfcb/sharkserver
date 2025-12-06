const Comment = require("../../models/comments");

const editComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check authorization
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this comment",
      });
    }

    comment.content = content.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();

    await comment.populate("author", "firstName lastName profilePicUrl");

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: {
        ...comment.toObject(),
        likesCount: comment.likes?.length || 0,
        isLiked:
          comment.likes?.some((id) => id.toString() === userId.toString()) ||
          false,
        likes: undefined,
      },
    });
  } catch (err) {
    console.error("Error editing comment:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { editComment };
