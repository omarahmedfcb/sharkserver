const { default: mongoose } = require("mongoose");
const { Notification } = require("../../models/notifications");
const { Offer } = require("../../models/offers");
const { Project } = require("../../models/projects");
const User = require("../../models/users");

const acceptOffer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const offer = await Offer.findById(id).session(session);
    if (!offer || offer.status !== "pending") {
      throw new Error("Offer not found or already processed");
    }

    const project = await Project.findById(offer.project).session(session);
    if (!project) throw new Error("Project not found");

    if (offer.percentage > project.availablePercentage) {
      throw new Error("Not enough available percentage");
    }

    offer.status = "accepted";
    await offer.save({ session });

    const existingInvestor = project.investors.find(
      (inv) => inv.user.toString() === offer.offeredBy.toString()
    );

    if (existingInvestor) {
      existingInvestor.percentage += offer.percentage;
      existingInvestor.amount += offer.amount;
    } else {
      project.investors.push({
        user: offer.offeredBy,
        percentage: offer.percentage,
        amount: offer.amount,
      });
    }

    project.availablePercentage -= offer.percentage;
    project.progress += offer.percentage;
    await project.save({ session });

    const user = await User.findById(offer.offeredBy).session(session);
    if (!user) throw new Error("User not found");
    const existingInvestment = user.investedProjects.find(
      (p) => p.project.toString() === project._id.toString()
    );

    if (existingInvestment) {
      existingInvestment.percentage += offer.percentage;
      existingInvestment.amount += offer.amount;
    } else {
      user.investedProjects.push({
        project: project._id,
        percentage: offer.percentage,
        amount: offer.amount,
        investedAt: new Date(),
      });
    }

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Offer accepted successfully",
    });

    const notification = await Notification.create({
      user: offer.offeredBy,
      message: `Your offer for ${project.title} was accepted`,
      link: `/projects/${project._id}`,
      type: "offer_accepted",
    }).catch((err) => {
      console.error("Notification creation failed:", err);
      return null;
    });

    // Broadcast notification via Socket.IO
    if (notification) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${offer.offeredBy}`).emit("notification", {
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
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { acceptOffer };
