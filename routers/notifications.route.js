const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getUserNotifications,
} = require("../controllers/notifications/getusernotifications.controller");
const {
  setAsRead,
} = require("../controllers/notifications/setasread.controller");

const router = express.Router();

router.get("/user", requireAuth, getUserNotifications);
router.patch("/read/:id", requireAuth, setAsRead);

module.exports = router;
