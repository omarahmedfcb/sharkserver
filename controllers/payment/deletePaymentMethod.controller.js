const { PaymentMethod } = require("../../models/paymentMethods");

const deletePaymentMethod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Find payment method
    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      userId,
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found",
      });
    }

    // Soft delete (set isActive to false)
    paymentMethod.isActive = false;
    await paymentMethod.save();

    res.status(200).json({
      success: true,
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete payment method",
    });
  }
};

module.exports = { deletePaymentMethod };

