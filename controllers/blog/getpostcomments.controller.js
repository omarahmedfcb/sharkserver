const mongoose = require("mongoose");
const Comment = require("../../models/comments");

const getPostComments = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user?._id; // Get user if logged in

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post ID" });
    }

    const postComments = await Comment.find({ post: postId })
      .populate("author", "firstName lastName profilePicUrl")
      .sort({ createdAt: -1 })
      .lean();

    // Add isLiked and likesCount to each comment
    const commentsWithLikes = postComments.map((comment) => ({
      ...comment,
      likesCount: comment.likes?.length || 0,
      isLiked: userId
        ? comment.likes?.some((id) => id.toString() === userId.toString())
        : false,
      likes: undefined, // Don't send full likes array
    }));

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      postComments: commentsWithLikes,
    });
  } catch (err) {
    console.error("Error fetching post comments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getPostComments };
