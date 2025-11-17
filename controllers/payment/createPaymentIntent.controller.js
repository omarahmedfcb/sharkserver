const PaymentServiceFactory = require("../../services/payment/PaymentServiceFactory");
const { Project } = require("../../models/projects");
const { Transaction } = require("../../models/payments");

const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { projectId, amount, percentage } = req.body;

    // Validate required fields
    if (!projectId || !amount || !percentage) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: projectId, amount, percentage",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Validate percentage
    if (percentage <= 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage must be between 0 and 100",
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is the owner (owners can't invest in their own projects)
    if (project.owner.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot invest in your own project",
      });
    }

    // Check available percentage
    if (percentage > project.availablePercentage) {
      return res.status(400).json({
        success: false,
        message: "Requested percentage exceeds available percentage",
        availablePercentage: project.availablePercentage,
      });
    }

    // Get payment service
    const paymentService = PaymentServiceFactory.getPaymentService();

    // Create payment intent
    const { paymentIntentId, clientSecret } = await paymentService.createPaymentIntent(
      amount,
      "USD", // Default currency, can be made configurable
      {
        userId: userId.toString(),
        projectId: projectId.toString(),
        percentage,
        projectTitle: project.title,
      }
    );

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      amount,
      currency: "USD",
      paymentMethod: "card",
      status: "pending",
      paymentIntentId,
      metadata: {
        percentage,
        projectTitle: project.title,
      },
    });

    res.status(200).json({
      success: true,
      paymentIntentId,
      clientSecret,
      transactionId: transaction.transactionId,
      amount,
      currency: "USD",
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment intent",
    });
  }
};

module.exports = { createPaymentIntent };

