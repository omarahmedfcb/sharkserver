const mongoose = require("mongoose");
const Comment = require("../../models/comments");

const getPostComments = async (req, res) => {
  try {
    const { id: postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid post ID" });
    }

    const postComments = await Comment.find({ post: postId })
      .populate("author", "firstName lastName profilePicUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      postComments,
    });
  } catch (err) {
    console.error("Error fetching post comments:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getPostComments };
