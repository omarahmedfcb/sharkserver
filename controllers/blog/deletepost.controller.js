const Post = require("../../models/posts");
const Comment = require("../../models/comments");

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    if (
      post.author.toString() !== userId.toString() &&
      req.user.accountType !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this post",
      });
    }

    await Comment.deleteMany({ post: post._id });

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Post and related comments deleted successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { deletePost };
