const { default: mongoose } = require("mongoose");
const PaymentServiceFactory = require("../../services/payment/PaymentServiceFactory");
const { Transaction } = require("../../models/payments");
const { Project } = require("../../models/projects");
const { Offer } = require("../../models/offers");
const User = require("../../models/users");
const paymentConfig = require("../../config/payment.config");

const refundPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactionId, amount } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Find transaction
    const transaction = await Transaction.findOne({ transactionId }).session(session);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Verify transaction belongs to user or user is admin
    if (
      transaction.userId.toString() !== userId.toString() &&
      req.user.accountType !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to transaction",
      });
    }

    // Check if transaction is completed
    if (transaction.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed transactions can be refunded",
        currentStatus: transaction.status,
      });
    }

    // Check if already refunded
    if (transaction.status === "refunded") {
      return res.status(400).json({
        success: false,
        message: "Transaction already refunded",
      });
    }

    // Check refund window (if configured)
    const refundWindow = paymentConfig.refundWindow || 30; // days
    const daysSincePayment = Math.floor(
      (Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePayment > refundWindow) {
      return res.status(400).json({
        success: false,
        message: `Refund window expired. Refunds must be requested within ${refundWindow} days.`,
      });
    }

    // Determine refund amount
    const refundAmount = amount || transaction.amount;
    const remainingAmount = transaction.amount - (transaction.refundedAmount || 0);

    if (refundAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed remaining amount (${remainingAmount})`,
        remainingAmount,
      });
    }

    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Refund amount must be greater than 0",
      });
    }

    // Get payment service
    const paymentService = PaymentServiceFactory.getPaymentService();

    // Process refund
    const refundResult = await paymentService.refundPayment(transactionId, refundAmount);

    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        message: refundResult.message || "Refund failed",
      });
    }

    // Update transaction
    transaction.refundedAmount = (transaction.refundedAmount || 0) + refundAmount;
    transaction.refundedAt = new Date();

    if (transaction.refundedAmount >= transaction.amount) {
      transaction.status = "refunded";
    }

    await transaction.save({ session });

    // If full refund, reverse the investment
    if (transaction.status === "refunded" && transaction.offerId) {
      const offer = await Offer.findById(transaction.offerId).session(session);
      if (offer && offer.status === "accepted") {
        const project = await Project.findById(transaction.projectId).session(session);
        if (project) {
          // Remove investor from project
          project.investors = project.investors.filter(
            (inv) => inv.user.toString() !== transaction.userId.toString()
          );
          project.availablePercentage += offer.percentage;
          project.progress = Math.max(0, project.progress - offer.percentage);
          await project.save({ session });
        }

        // Remove investment from user
        const user = await User.findById(transaction.userId).session(session);
        if (user) {
          user.investedProjects = user.investedProjects.filter(
            (inv) => inv.project.toString() !== transaction.projectId.toString()
          );
          await user.save({ session });
        }

        // Update offer status
        offer.status = "cancelled";
        await offer.save({ session });
      }
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refundId: refundResult.refundId,
      refundAmount,
      transactionStatus: transaction.status,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process refund",
    });
  }
};

module.exports = { refundPayment };

