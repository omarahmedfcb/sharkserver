const Post = require("../../models/posts");

const addPost = async (req, res) => {
  try {
    const author = req.user._id;
    const { content, title } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newPost = await Post.create({ content, author, title });
    res.status(201).json({
      success: true,
      message: "Post added successfully",
      newPost: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { addPost };
