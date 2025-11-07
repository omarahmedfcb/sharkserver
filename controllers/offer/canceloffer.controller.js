const { Notification } = require("../../models/notifications");
const { Offer } = require("../../models/offers");
const { Project } = require("../../models/projects");

const cancelOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const cancelledOffer = await Offer.findByIdAndUpdate(
      { _id: id, status: "pending" },

      { status: "cancelled" },
      { new: true }
    );
    const requestedProject = await Project.findById(cancelledOffer.project);

    if (!cancelledOffer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer is not pending or not found" });
    }

    res.status(200).json({
      success: true,
      message: "Offer cancelled successfully",
    });

    Notification.create({
      user: cancelledOffer.offeredTo,
      message: `The Offer for ${requestedProject.title} was cancelled`,
      link: `/account/offers`,
      type: "offer_cancelled",
    }).catch((err) => console.error("Notification creation failed:", err));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { cancelOffer };
