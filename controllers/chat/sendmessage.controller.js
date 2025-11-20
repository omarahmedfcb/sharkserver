const Conversation = require("../../models/conversation");
const Message = require("../../models/messages");
const { Notification } = require("../../models/notifications");
const User = require("../../models/users");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ error: "Receiver and content are required" });
    }
    const receiver = await User.findById(receiverId).select("banned");
    if (receiver?.banned) {
      return res
        .status(400)
        .json({ error: "You can't send a message to a banned user" });
    }

    // Validate that sender and receiver are different
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    // Step 1: Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Step 2: Create message
    const newMessage = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      content,
    });

    // Step 3: Populate sender details for real-time emission
    await newMessage.populate("sender", "firstName lastName");

    // Step 4: Update last message in conversation
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Step 5: Emit message in real-time to both participants
    const io = req.app.get("io");

    // Emit to conversation room
    io.to(conversation._id.toString()).emit("receive_message", {
      message: newMessage,
      conversationId: conversation._id,
    });

    // Step 6: Respond
    res.status(201).json({
      message: "Message sent successfully",
      success: true,
      conversationId: conversation._id,
      newMessage,
    });

    Notification.create({
      user: receiverId,
      message: "You received a message",
      link: `/chat/${conversation._id}`,
      type: "message",
    }).catch((err) => console.error("Notification creation failed:", err));
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { sendMessage };
