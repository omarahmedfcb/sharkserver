const { Notification } = require("../../models/notifications");
const { Offer } = require("../../models/offers");
const { Project } = require("../../models/projects");

const rejectOffer = async (req, res) => {
  try {
    const { id } = req.params;

    const rejectedOffer = await Offer.findByIdAndUpdate(
      { _id: id, status: "pending" },

      { status: "rejected" },
      { new: true }
    );
    const project = await Project.findById(rejectedOffer.project);
    if (!rejectedOffer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer is not pending or not found" });
    }

    res.status(200).json({
      success: true,
      message: "Offer rejected successfully",
    });

    Notification.create({
      user: rejectedOffer.offeredBy,
      message: `Your Offer for ${project.title} was rejected`,
      link: `/projects/${project._id}`,
      type: "offer_rejected",
    }).catch((err) => console.error("Notification creation failed:", err));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { rejectOffer };
