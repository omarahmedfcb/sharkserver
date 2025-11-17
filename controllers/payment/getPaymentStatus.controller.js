const PaymentServiceFactory = require("../../services/payment/PaymentServiceFactory");
const { Transaction } = require("../../models/payments");
const { Project } = require("../../models/projects");

const getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user._id;

    // Find transaction
    const transaction = await Transaction.findOne({ transactionId })
      .populate("projectId", "title image")
      .populate("userId", "firstName lastName email");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Verify transaction belongs to user (unless admin)
    if (
      transaction.userId._id.toString() !== userId.toString() &&
      req.user.accountType !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to transaction",
      });
    }

    // Get payment service
    const paymentService = PaymentServiceFactory.getPaymentService();

    // Get payment status from service
    let paymentStatus;
    try {
      paymentStatus = await paymentService.getPaymentStatus(transactionId);
    } catch (error) {
      // If service doesn't have the transaction, use database status
      paymentStatus = {
        status: transaction.status,
        details: {
          transactionId: transaction.transactionId,
          amount: transaction.amount,
          currency: transaction.currency,
          createdAt: transaction.createdAt,
        },
      };
    }

    res.status(200).json({
      success: true,
      transaction: {
        transactionId: transaction.transactionId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        project: {
          _id: transaction.projectId._id,
          title: transaction.projectId.title,
          image: transaction.projectId.image,
        },
        user: {
          _id: transaction.userId._id,
          firstName: transaction.userId.firstName,
          lastName: transaction.userId.lastName,
          email: transaction.userId.email,
        },
        failureReason: transaction.failureReason,
        refundedAmount: transaction.refundedAmount || 0,
        refundedAt: transaction.refundedAt,
      },
      paymentStatus,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get payment status",
    });
  }
};

module.exports = { getPaymentStatus };

