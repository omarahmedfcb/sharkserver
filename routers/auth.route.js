const express = require("express");
const rateLimit = require("express-rate-limit");
const { signUp } = require("../controllers/auth/signup.controller");
const { signIn } = require("../controllers/auth/signin.controller");
const { googleAuth } = require("../controllers/auth/google.controller");
const { logOut } = require("../controllers/auth/logout.controller");
const { requireAuth } = require("../middleware/auth");
const {
  removeProfilePicture,
  uploadProfilePicture,
  upload,
} = require("../controllers/auth/profilepic.controller");
const { updateProfile } = require("../controllers/auth/updateprofile.controller");
const { changePassword } = require("../controllers/auth/changepassword.controller");
const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please try again later.",
  },
});

router.post("/signup", authLimiter, signUp);
router.post("/signin", authLimiter, signIn);
router.post("/google", authLimiter, googleAuth);
router.post("/logout", logOut);
router.post(
  "/upload-profile-picture",
  requireAuth,
  upload.single("profilePicUrl"),
  uploadProfilePicture
);

router.delete("/remove-profile-picture", requireAuth, removeProfilePicture);
router.get("/me", requireAuth, async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.patch("/profile", requireAuth, updateProfile);
router.patch("/password", requireAuth, changePassword);

module.exports = router;
