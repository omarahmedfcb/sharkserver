const express = require("express");
const rateLimit = require("express-rate-limit");
const { signUp } = require("../controllers/auth/signup.controller");
const { signIn } = require("../controllers/auth/signin.controller");
const { googleAuth } = require("../controllers/auth/google.controller");
const { logOut } = require("../controllers/auth/logout.controller");
const { requireAuth } = require("../middleware/auth");
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
router.get("/me", requireAuth, async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
