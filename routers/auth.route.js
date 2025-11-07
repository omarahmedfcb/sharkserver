const express = require("express");
const { signUp } = require("../controllers/auth/signup.controller");
const { signIn } = require("../controllers/auth/signin.controller");
const { logOut } = require("../controllers/auth/logout.controller");
const { requireAuth } = require("../middleware/auth");
const {
  removeProfilePicture,
  uploadProfilePicture,
  upload,
} = require("../controllers/auth/profilepic.controller");
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
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

module.exports = router;
