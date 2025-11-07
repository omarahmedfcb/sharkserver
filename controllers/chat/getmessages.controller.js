const Conversation = require("../../models/conversation");
const Message = require("../../models/messages");

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "firstName lastName")
      .sort({ createdAt: 1 });

    res.status(201).json({
      message: "Messages fetched successfully successfully",
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getMessages };
