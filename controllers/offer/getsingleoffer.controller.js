const { Offer } = require("../../models/offers");
const mongoose = require("mongoose");

const getSingleOffer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: offerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid offer ID" });
    }

    const offer = await Offer.findById(offerId)
      .populate("offeredBy", "firstName lastName email")
      .populate("offeredTo", "firstName lastName email")
      .populate("project", "title");

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found" });
    }

    if (
      offer.offeredBy._id.toString() !== userId.toString() &&
      offer.offeredTo._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "User is not authorized to view this offer",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer fetched successfully",
      offer,
    });
  } catch (err) {
    console.error("Error fetching offer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getSingleOffer };
