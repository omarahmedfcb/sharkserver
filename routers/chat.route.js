const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { sendMessage } = require("../controllers/chat/sendmessage.controller");
const {
  getConversations,
} = require("../controllers/chat/getconversations.controller");
const { getMessages } = require("../controllers/chat/getmessages.controller");

const router = express.Router();

router.post("/send", requireAuth, sendMessage);
router.get("/conversations", requireAuth, getConversations);
router.get("/:conversationId", requireAuth, getMessages);
module.exports = router;
