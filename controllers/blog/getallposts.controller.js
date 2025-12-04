const Post = require("../../models/posts");

const getAllPosts = async (req, res) => {
  try {
    const userId = req.user?._id;
    const allPosts = await Post.find()
      .populate("author", "firstName lastName profilePicUrl")
      .sort({ createdAt: -1 })
      .lean();

    const postsWithLikes = allPosts.map((post) => ({
      ...post,
      likesCount: post.likes?.length || 0,
      isLiked: userId
        ? post.likes?.some((id) => id.toString() === userId.toString())
        : false,
    }));

    res.status(200).json({
      success: true,
      message: "posts fetched successfully",
      allPosts: postsWithLikes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllPosts };
