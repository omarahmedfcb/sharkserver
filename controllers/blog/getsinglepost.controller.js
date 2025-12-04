const Post = require("../../models/posts");

const getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const post = await Post.findById(id)
      .populate("author", "firstName lastName profilePicUrl")
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const postWithLikes = {
      ...post,
      likesCount: post.likes?.length || 0,
      isLiked: userId
        ? post.likes?.some((id) => id.toString() === userId.toString())
        : false,
      likes: undefined,
    };

    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      post: postWithLikes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSinglePost };
