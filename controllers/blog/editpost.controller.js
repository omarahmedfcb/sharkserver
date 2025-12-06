const Post = require("../../models/posts");
const { uploadPostImage } = require("./uploadpostimage.controller");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, removeImage } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check authorization
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this post",
      });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;

    // Handle image removal
    if (removeImage === "true" && post.imageUrl) {
      const filePath = post.imageUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("blog-images").remove([filePath]);
      post.imageUrl = "";
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (post.imageUrl) {
        const oldPath = post.imageUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("blog-images").remove([oldPath]);
      }
      // Upload new image
      const imageUrl = await uploadPostImage(req.file.buffer, post._id);
      post.imageUrl = imageUrl;
    }

    await post.save();
    await post.populate("author", "firstName lastName profilePicUrl");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: {
        ...post.toObject(),
        likesCount: post.likes?.length || 0,
        isLiked:
          post.likes?.some((id) => id.toString() === userId.toString()) ||
          false,
        likes: undefined,
      },
    });
  } catch (err) {
    console.error("Error editing post:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { editPost };
