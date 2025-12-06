const { Notification } = require("../../models/notifications");
const Post = require("../../models/posts");

const likePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    // Check if post exists
    const post = await Post.findById(postId).populate("author", "_id");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You already liked this post",
      });
    }

    // Add like
    post.likes.push(userId);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      likesCount: post.likes.length,
    });

    // Create notification (async, don't wait for it)
    if (post.author._id.toString() !== userId.toString()) {
      Notification.create({
        user: post.author._id,
        message: `${req.user.firstName} ${req.user.lastName} liked your post`,
        link: `/blog/${post._id}`,
        type: "like",
      }).catch((err) => console.error("Notification creation failed:", err));
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const unlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user hasn't liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You haven't liked this post",
      });
    }

    // Remove like
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post unliked successfully",
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { likePost, unlikePost };
