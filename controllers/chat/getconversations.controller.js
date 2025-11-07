const Conversation = require("../../models/conversation");

const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "firstName lastName email profilePicUrl")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(201).json({
      message: "Conversation fetched successfully successfully",
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getConversations };
