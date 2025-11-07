const { default: mongoose } = require("mongoose");
const { Notification } = require("../../models/notifications");
const { Offer } = require("../../models/offers");
const { Project } = require("../../models/projects");

const acceptOffer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const offer = await Offer.findById(id).session(session);
    if (!offer || offer.status !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Offer not found or already processed",
      });
    }

    const project = await Project.findById(offer.project).session(session);
    if (!project) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (offer.percentage > project.availablePercentage) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ success: false, message: "Not enough available percentage" });
    }

    offer.status = "accepted";
    await offer.save({ session });

    project.availablePercentage -= offer.percentage;
    project.progress += offer.percentage;
    project.investors.push({
      user: offer.offeredBy,
      percentage: offer.percentage,
      amount: offer.amount,
    });
    await project.save({ session });

    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ success: true, message: "Offer accepted successfully" });

    Notification.create({
      user: offer.offeredBy,
      message: `Your Offer for ${project.title} was accepted`,
      link: `/projects/${project._id}`,
      type: "offer_accepted",
    }).catch((err) => console.error("Notification creation failed:", err));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { acceptOffer };
