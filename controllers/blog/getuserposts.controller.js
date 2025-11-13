const Post = require("../../models/posts");

const getUserPosts = async (req, res) => {
  try {
    const author = req.user._id;
    const userPosts = await Post.find({ author }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      userPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { getUserPosts };
