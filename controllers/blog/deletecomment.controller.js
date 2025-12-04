const Comment = require("../../models/comments");
const Post = require("../../models/posts");

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    if (comment.author.toString() !== userId.toString()) {
      if (req.user.accountType !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this comment",
        });
      }
    }

    await Comment.findByIdAndDelete(id);
    const meantPost = await Post.findById(comment.post).select("commentsCount");
    meantPost.commentsCount -= 1;
    await meantPost.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { deleteComment };
