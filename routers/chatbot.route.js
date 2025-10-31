const express = require("express");
const router = express.Router();
const { askChatbot } = require("../controllers/chatbot/chatbot.controller");

// Chatbot route
router.post("/ask", askChatbot);

module.exports = router;

