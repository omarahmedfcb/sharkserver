const PaymentServiceFactory = require("../../services/payment/PaymentServiceFactory");
const { PaymentMethod } = require("../../models/paymentMethods");

const savePaymentMethod = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, cardNumber, expiryMonth, expiryYear, cardholderName, isDefault } = req.body;

    // Validate required fields
    if (!type || !cardNumber || !expiryMonth || !expiryYear || !cardholderName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Get payment service
    const paymentService = PaymentServiceFactory.getPaymentService();

    // Validate payment method
    const validation = await paymentService.validatePaymentMethod({
      cardNumber,
      expiryMonth,
      expiryYear,
      cardholderName,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
        errors: validation.errors,
      });
    }

    // Determine card brand
    const getCardBrand = (cardNumber) => {
      const cleaned = cardNumber.replace(/\s+/g, "");
      if (/^4/.test(cleaned)) return "Visa";
      if (/^5[1-5]/.test(cleaned)) return "Mastercard";
      if (/^3[47]/.test(cleaned)) return "American Express";
      if (/^6(?:011|5)/.test(cleaned)) return "Discover";
      return "Other";
    };

    // Save payment method with service (tokenization)
    const savedMethod = await paymentService.savePaymentMethod(
      {
        cardNumber,
        expiryMonth,
        expiryYear,
        cardholderName,
      },
      userId
    );

    // Save to database
    const paymentMethod = await PaymentMethod.create({
      userId,
      type,
      provider: "mock", // Will be dynamic based on payment config
      last4: cardNumber.slice(-4),
      brand: getCardBrand(cardNumber),
      expiryMonth: parseInt(expiryMonth),
      expiryYear: parseInt(expiryYear),
      cardholderName,
      isDefault: isDefault || false,
      isActive: true,
      providerPaymentMethodId: savedMethod.paymentMethodId,
    });

    // If this is set as default, unset other defaults
    if (paymentMethod.isDefault) {
      await PaymentMethod.updateMany(
        { userId, _id: { $ne: paymentMethod._id } },
        { isDefault: false }
      );
    }

    res.status(201).json({
      success: true,
      message: "Payment method saved successfully",
      paymentMethod: {
        _id: paymentMethod._id,
        type: paymentMethod.type,
        last4: paymentMethod.last4,
        brand: paymentMethod.brand,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear,
        cardholderName: paymentMethod.cardholderName,
        isDefault: paymentMethod.isDefault,
      },
    });
  } catch (error) {
    console.error("Error saving payment method:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save payment method",
    });
  }
};

module.exports = { savePaymentMethod };

