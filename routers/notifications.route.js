const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getUserNotifications,
} = require("../controllers/notifications/getusernotifications.controller");

const router = express.Router();

router.get("/user", requireAuth, getUserNotifications);
module.exports = router;
