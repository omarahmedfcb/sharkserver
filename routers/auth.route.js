const express = require("express");
const { signUp } = require("../controllers/auth/signup.controller");
const { signIn } = require("../controllers/auth/signin.controller");
const { logOut } = require("../controllers/auth/logout.controller");
const { requireAuth } = require("../middleware/auth");
const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logOut);
router.get("/me", requireAuth, async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
