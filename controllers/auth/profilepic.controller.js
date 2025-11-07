// controllers/auth/uploadProfilePicture.controller.js
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const User = require("../../models/users");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get user to check for old profile picture
    const user = await User.findById(userId);

    // Process image
    const processedImage = await sharp(file.buffer)
      .resize(400, 400, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Generate filename
    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = `profile-pictures/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, processedImage, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Delete old profile picture if exists
    if (user.profilePicUrl) {
      const oldPath = user.profilePicUrl.split("/").slice(-2).join("/");
      await supabase.storage.from("avatars").remove([oldPath]);
    }

    // Update user
    user.profilePicUrl = publicUrl;
    await user.save();

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      success: true,
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user.profilePicUrl) {
      return res.status(400).json({ error: "No profile picture to remove" });
    }

    // Delete from Supabase
    const filePath = user.profilePicUrl.split("/").slice(-2).join("/");
    await supabase.storage.from("avatars").remove([filePath]);

    // Update user
    user.profilePicUrl = null;
    await user.save();

    res.status(200).json({
      message: "Profile picture removed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    res.status(500).json({ error: "Failed to remove profile picture" });
  }
};

module.exports = { upload, uploadProfilePicture, removeProfilePicture };
