const Comment = require("../../models/comments");
const { Notification } = require("../../models/notifications");
const Post = require("../../models/posts");

const addComment = async (req, res) => {
  try {
    const author = req.user._id;
    const { content, post } = req.body;

    if (!content || !post || !author) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newComment = await Comment.create({ content, author, post });

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });

    (async () => {
      try {
        const meantPost = await Post.findById(post).select("author");
        if (meantPost && meantPost.author.toString() !== author.toString()) {
          await Notification.create({
            user: meantPost.author,
            message: `You got a new comment on your post`,
            link: `/blog/${meantPost._id}`,
            type: "comment",
          });
        }
      } catch (err) {
        console.error("Notification creation failed:", err);
      }
    })();
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addComment };
