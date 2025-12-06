const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for blog post images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const uploadPostImage = async (imageBuffer, postId) => {
  try {
    // Generate filename
    const fileName = `${postId}-${Date.now()}.jpg`;
    const filePath = `blog-images/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("blog-images") // You'll need to create this bucket in Supabase
      .upload(filePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("blog-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading post image:", error);
    throw error;
  }
};

const updatePostImage = async (req, res) => {
  try {
    const { postId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const Post = require("../../models/posts");
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Upload new image
    const publicUrl = await uploadPostImage(file.buffer, postId);

    // Delete old image if exists
    if (post.imageUrl) {
      const oldPath = post.imageUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("blog-images").remove([oldPath]);
    }

    // Update post
    post.imageUrl = publicUrl;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post image updated successfully",
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error updating post image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update post image",
    });
  }
};

const removePostImage = async (req, res) => {
  try {
    const { postId } = req.params;
    const Post = require("../../models/posts");
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    if (!post.imageUrl) {
      return res.status(400).json({
        success: false,
        error: "No post image to remove",
      });
    }

    // Delete from Supabase
    const filePath = post.imageUrl.split("/").slice(-2).join("/");
    await supabase.storage.from("blog-images").remove([filePath]);

    // Update post
    post.imageUrl = "";
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post image removed successfully",
    });
  } catch (error) {
    console.error("Error removing post image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove post image",
    });
  }
};

module.exports = {
  upload,
  uploadPostImage,
  updatePostImage,
  removePostImage,
};
