const express = require("express");
const { signUp } = require("../controllers/auth/signup.controller");
const { signIn } = require("../controllers/auth/signin.controller");
const { logOut } = require("../controllers/auth/logout.controller");
const { requireAuth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/users");

const router = express.Router();

// إعداد مكان تخزين الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Authentication routes
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logOut);
router.post("/register", signUp);

// ✅ Get current user info
router.get("/me", requireAuth, async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update user profile
router.put("/update", requireAuth, upload.single("image"), async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const userId = req.user.id;

    // بيانات التحديث
    const updateData = {
      firstName,
      lastName,
      phone,
    };

    if (req.file) {
      updateData.profilePicUrl = `/uploads/${req.file.filename}`;
    }

    // تحديث المستخدم
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("firstName lastName email phone profilePicUrl");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
