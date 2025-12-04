const Post = require("../../models/posts");
const User = require("../../models/users");
const { uploadPostImage } = require("./uploadpostimage.controller");

const addPost = async (req, res) => {
  try {
    const author = req.user._id;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    // Create post first
    const newPost = await Post.create({
      title,
      content,
      author,
      imageUrl: "", // Empty initially
    });

    // Upload image if provided
    if (req.file) {
      try {
        const imageUrl = await uploadPostImage(req.file.buffer, newPost._id);
        newPost.imageUrl = imageUrl;
        await newPost.save();
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        // Continue without image - it's optional
      }
    }

    // Populate author info for response
    await newPost.populate("author", "firstName lastName profilePicUrl");

    res.status(201).json({
      success: true,
      message: "Post added successfully",
      newPost: {
        ...newPost.toObject(),
        likesCount: 0,
        isLiked: false,
      },
    });
  } catch (err) {
    console.error("Error adding post:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { addPost };
