const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { banUser } = require("../controllers/admin/banuser.controller");
const { unbanUser } = require("../controllers/admin/unbanuser.controller");
const {
  getUsersBanStatus,
} = require("../controllers/admin/getusersstatus.controller");

const router = express.Router();

router.get("/ban/:id", requireAuth, banUser);
router.get("/unban/:id", requireAuth, unbanUser);
router.get("/users", requireAuth, getUsersBanStatus);

module.exports = router;
