const { Offer } = require("../../models/offers");
const User = require("../../models/users");

const getSentOffers = async (req, res) => {
  try {
    const userId = req.user._id;

    const offers = await Offer.find({ offeredBy: userId })
      .populate("project", "title category")
      .populate("offeredTo", "firstName lastName")
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

module.exports = { getSentOffers };
