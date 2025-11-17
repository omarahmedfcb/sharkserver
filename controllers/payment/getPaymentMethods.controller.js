const { PaymentMethod } = require("../../models/paymentMethods");

const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all active payment methods for user
    const paymentMethods = await PaymentMethod.find({
      userId,
      isActive: true,
    })
      .sort({ isDefault: -1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      paymentMethods: paymentMethods.map((method) => ({
        _id: method._id,
        type: method.type,
        last4: method.last4,
        brand: method.brand,
        expiryMonth: method.expiryMonth,
        expiryYear: method.expiryYear,
        cardholderName: method.cardholderName,
        isDefault: method.isDefault,
        createdAt: method.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting payment methods:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get payment methods",
    });
  }
};

module.exports = { getPaymentMethods };

