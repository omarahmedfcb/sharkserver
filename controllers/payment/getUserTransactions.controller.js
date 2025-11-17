const { Transaction } = require("../../models/payments");

const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 50, skip = 0 } = req.query;

    // Build query
    const query = { userId };
    if (status && status !== "all") {
      query.status = status;
    }

    // Get transactions
    const transactions = await Transaction.find(query)
      .populate("projectId", "title image")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Get total count
    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions: transactions.map((t) => ({
        transactionId: t.transactionId,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        project: {
          _id: t.projectId?._id,
          title: t.projectId?.title,
          image: t.projectId?.image,
        },
        failureReason: t.failureReason,
        refundedAmount: t.refundedAmount || 0,
        refundedAt: t.refundedAt,
        metadata: t.metadata,
      })),
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error("Error getting user transactions:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get transactions",
    });
  }
};

module.exports = { getUserTransactions };

