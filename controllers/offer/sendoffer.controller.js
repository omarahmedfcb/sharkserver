const { Offer } = require("../../models/offers");
const User = require("../../models/users");
const { Project } = require("../../models/projects");
const { Notification } = require("../../models/notifications");

const sendOffer = async (req, res) => {
  try {
    const offeredBy = req.user._id;
    const { project, offeredTo, percentage, amount, proposalLetter } = req.body;
    if (!project || !offeredBy || !offeredTo || !percentage || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (percentage <= 0) {
      return res
        .status(400)
        .json({ message: "Percentage must be greater than 0" });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(offeredBy),
      User.findById(offeredTo),
    ]);
    const requestedProject = await Project.findById(project);
    if (percentage > requestedProject.availablePercentage) {
      return res.status(400).json({
        message: "the requested percentage is not available for sale",
      });
    }
    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }
    if (receiver?.banned) {
      return res
        .status(400)
        .json({ error: "You can't send an offer to a banned user" });
    }
    const createdOffer = await Offer.create({
      project,
      offeredBy,
      offeredTo,
      percentage,
      amount,
      proposalLetter,
    });

    res.status(201).json({
      success: true,
      message: "Offer sent successfully",
    });

    const notification = await Notification.create({
      user: offeredTo,
      message: `You received an Offer for ${requestedProject.title}`,
      link: `/account/offers/${createdOffer._id}`,
      type: "offer_sent",
    }).catch((err) => {
      console.error("Notification creation failed:", err);
      return null;
    });

    // Broadcast notification via Socket.IO
    if (notification) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${offeredTo}`).emit("notification", {
          _id: notification._id,
          message: notification.message,
          link: notification.link,
          type: notification.type,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { sendOffer };
