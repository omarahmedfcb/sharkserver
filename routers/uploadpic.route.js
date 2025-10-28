const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const uploadProfilePic = require("../controllers/uploadpic.controller");

// Route: POST /api/upload/profile
router.post("/profilepic", requireAuth, uploadProfilePic);

module.exports = router;
