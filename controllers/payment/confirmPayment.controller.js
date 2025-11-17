const { default: mongoose } = require("mongoose");
const PaymentServiceFactory = require("../../services/payment/PaymentServiceFactory");
const { Transaction } = require("../../models/payments");
const { Project } = require("../../models/projects");
const { Offer } = require("../../models/offers");
const User = require("../../models/users");
const { Notification } = require("../../models/notifications");

const confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user._id;
    const { paymentIntentId, paymentMethod, savePaymentMethod } = req.body;

    // Validate required fields
    if (!paymentIntentId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: paymentIntentId, paymentMethod",
      });
    }

    // Find transaction by payment intent ID
    const transaction = await Transaction.findOne({ paymentIntentId }).session(session);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Verify transaction belongs to user
    if (transaction.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to transaction",
      });
    }

    // Check if transaction is already processed
    if (transaction.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Transaction already ${transaction.status}`,
        status: transaction.status,
      });
    }

    // Get payment service
    const paymentService = PaymentServiceFactory.getPaymentService();

    // Validate payment method
    const validation = await paymentService.validatePaymentMethod(paymentMethod);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
        errors: validation.errors,
      });
    }

    // Update transaction status to processing
    transaction.status = "processing";
    await transaction.save({ session });

    // Confirm payment with payment service
    const paymentResult = await paymentService.confirmPayment(paymentIntentId, paymentMethod);

    if (!paymentResult.success) {
      // Payment failed
      transaction.status = "failed";
      transaction.failureReason = paymentResult.message || "Payment failed";
      await transaction.save({ session });
      await session.commitTransaction();
      session.endSession();

      return res.status(400).json({
        success: false,
        message: paymentResult.message || "Payment failed",
        transactionId: transaction.transactionId,
        status: "failed",
      });
    }

    // Payment successful - update transaction
    transaction.status = paymentResult.status;
    transaction.transactionId = paymentResult.transactionId;
    transaction.paymentMethodId = paymentMethod.id || null;
    await transaction.save({ session });

    // Save payment method if requested
    if (savePaymentMethod && paymentMethod.cardNumber) {
      try {
        const savedMethod = await paymentService.savePaymentMethod(paymentMethod, userId);
        // You can save this to PaymentMethod model if needed
      } catch (error) {
        console.error("Error saving payment method:", error);
        // Don't fail the payment if saving method fails
      }
    }

    // Find or create offer
    const project = await Project.findById(transaction.projectId).session(session);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if offer already exists
    let offer = await Offer.findOne({
      project: transaction.projectId,
      offeredBy: userId,
      offeredTo: project.owner,
      status: "pending",
    }).session(session);

    const offerData = {
      project: transaction.projectId,
      offeredBy: userId,
      offeredTo: project.owner,
      percentage: transaction.metadata.percentage,
      amount: transaction.amount,
      proposalLetter: `Investment of ${transaction.amount} USD for ${transaction.metadata.percentage}%`,
    };

    if (offer) {
      // Update existing offer
      offer.percentage = offerData.percentage;
      offer.amount = offerData.amount;
      offer.proposalLetter = offerData.proposalLetter;
    } else {
      // Create new offer
      offer = await Offer.create([offerData], { session });
      offer = offer[0];
    }

    // Link transaction to offer
    transaction.offerId = offer._id;
    await transaction.save({ session });

    // Automatically accept the offer (since payment is confirmed)
    // Update project investors
    const existingInvestor = project.investors.find(
      (inv) => inv.user.toString() === userId.toString()
    );

    if (existingInvestor) {
      existingInvestor.percentage += offer.percentage;
    } else {
      project.investors.push({
        user: userId,
        percentage: offer.percentage,
      });
    }

    project.availablePercentage -= offer.percentage;
    project.progress += offer.percentage;
    await project.save({ session });

    // Update user invested projects
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    const existingInvestment = user.investedProjects.find(
      (p) => p.project.toString() === project._id.toString()
    );

    if (existingInvestment) {
      existingInvestment.percentage += offer.percentage;
    } else {
      user.investedProjects.push({
        project: project._id,
        percentage: offer.percentage,
        investedAt: new Date(),
      });
    }

    await user.save({ session });

    // Update offer status
    offer.status = "accepted";
    await offer.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Send notifications
    const notification = await Notification.create({
      user: project.owner,
      message: `New investment of ${transaction.amount} USD in ${project.title}`,
      link: `/projects/${project._id}`,
      type: "investment_received",
    }).catch((err) => {
      console.error("Notification creation failed:", err);
      return null;
    });

    // Broadcast notification via Socket.IO
    if (notification) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${project.owner}`).emit("notification", {
          _id: notification._id,
          message: notification.message,
          link: notification.link,
          type: notification.type,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment confirmed and investment completed",
      transactionId: transaction.transactionId,
      status: transaction.status,
      offerId: offer._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm payment",
    });
  }
};

module.exports = { confirmPayment };

