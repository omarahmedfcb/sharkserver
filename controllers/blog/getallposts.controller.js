const Post = require("../../models/posts");

const getAllPosts = async (req, res) => {
  try {
    const allPosts = await Post.find()
      .populate("author", "firstName lastName profilePicUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      allPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllPosts };
