const { Offer } = require("../../models/offers");
const User = require("../../models/users");

const getReceivedOffers = async (req, res) => {
  try {
    const userId = req.user._id;

    const offers = await Offer.find({
      offeredTo: userId,
      status: { $ne: "cancelled" },
    })
      .populate("project", "title category")
      .populate("offeredBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(201).json({
      success: true,
      message: "Offers got successfully",
      offers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getReceivedOffers };
