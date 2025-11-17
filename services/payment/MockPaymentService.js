const IPaymentService = require("./IPaymentService");
const paymentConfig = require("../../config/payment.config");

/**
 * Mock Payment Service
 * Simulates payment processing for testing and development
 */
class MockPaymentService extends IPaymentService {
  constructor() {
    super();
    this.paymentIntents = new Map(); // Store payment intents in memory
    this.transactions = new Map(); // Store transactions in memory
  }

  /**
   * Generate a unique payment intent ID
   */
  generatePaymentIntentId() {
    return `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique transaction ID
   */
  generateTransactionId() {
    return `txn_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a client secret (fake for mock)
   */
  generateClientSecret() {
    return `mock_secret_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * Validate card number using Luhn algorithm
   */
  validateCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s+/g, "");
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Determine card brand from number
   */
  getCardBrand(cardNumber) {
    const cleaned = cardNumber.replace(/\s+/g, "");
    if (/^4/.test(cleaned)) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "American Express";
    if (/^6(?:011|5)/.test(cleaned)) return "Discover";
    return "Other";
  }

  /**
   * Simulate payment processing delay
   */
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Determine payment result based on card number
   */
  determinePaymentResult(cardNumber, amount) {
    const cleaned = cardNumber.replace(/\s+/g, "");

    // Test card scenarios
    if (cleaned === paymentConfig.testCards.decline) {
      return {
        success: false,
        status: "failed",
        reason: "card_declined",
        message: "Your card was declined.",
      };
    }

    if (cleaned === paymentConfig.testCards.insufficientFunds) {
      return {
        success: false,
        status: "failed",
        reason: "insufficient_funds",
        message: "Your card has insufficient funds.",
      };
    }

    if (cleaned === paymentConfig.testCards.expired) {
      return {
        success: false,
        status: "failed",
        reason: "expired_card",
        message: "Your card has expired.",
      };
    }

    if (cleaned === paymentConfig.testCards.incorrectCvc) {
      return {
        success: false,
        status: "failed",
        reason: "incorrect_cvc",
        message: "Your card's security code is incorrect.",
      };
    }

    if (cleaned === paymentConfig.testCards.threeDSecure) {
      return {
        success: true,
        status: "requires_action",
        reason: "requires_3d_secure",
        message: "3D Secure authentication required.",
      };
    }

    // Default: success
    return {
      success: true,
      status: "completed",
      reason: null,
      message: "Payment successful.",
    };
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(amount, currency = "USD", metadata = {}) {
    // Validate amount
    if (amount < paymentConfig.minAmount) {
      throw new Error(`Amount must be at least ${paymentConfig.minAmount}`);
    }
    if (amount > paymentConfig.maxAmount) {
      throw new Error(`Amount cannot exceed ${paymentConfig.maxAmount}`);
    }

    const paymentIntentId = this.generatePaymentIntentId();
    const clientSecret = this.generateClientSecret();

    const paymentIntent = {
      id: paymentIntentId,
      amount,
      currency,
      status: "requires_payment_method",
      metadata,
      createdAt: new Date(),
    };

    this.paymentIntents.set(paymentIntentId, paymentIntent);

    return {
      paymentIntentId,
      clientSecret,
    };
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(paymentIntentId, paymentMethodData) {
    // Simulate processing delay
    await this.delay(paymentConfig.mockProcessingDelay);

    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      throw new Error("Payment intent not found");
    }

    // Extract card number from payment method data
    const cardNumber =
      paymentMethodData.cardNumber ||
      paymentMethodData.number ||
      paymentMethodData.card?.number;

    if (!cardNumber) {
      throw new Error("Card number is required");
    }

    // Validate card number
    if (!this.validateCardNumber(cardNumber)) {
      throw new Error("Invalid card number");
    }

    // Determine payment result
    const result = this.determinePaymentResult(cardNumber, paymentIntent.amount);

    const transactionId = this.generateTransactionId();

    const transaction = {
      id: transactionId,
      paymentIntentId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: result.status,
      cardBrand: this.getCardBrand(cardNumber),
      last4: cardNumber.slice(-4),
      metadata: {
        ...paymentIntent.metadata,
        mockResult: result,
      },
      createdAt: new Date(),
    };

    this.transactions.set(transactionId, transaction);

    // Update payment intent status
    paymentIntent.status = result.status;
    paymentIntent.transactionId = transactionId;

    if (result.status === "requires_action") {
      // Simulate 3D Secure - in real scenario, would redirect
      // For mock, we'll auto-approve after a delay
      await this.delay(1000);
      transaction.status = "completed";
      result.status = "completed";
      result.success = true;
    }

    return {
      success: result.success,
      transactionId,
      status: result.status,
      message: result.message,
      requiresAction: result.status === "requires_action",
    };
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId, amount = null) {
    await this.delay(1000); // Simulate processing delay

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "completed") {
      throw new Error("Only completed transactions can be refunded");
    }

    const refundAmount = amount || transaction.amount;
    if (refundAmount > transaction.amount) {
      throw new Error("Refund amount cannot exceed transaction amount");
    }

    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    transaction.refundedAmount = (transaction.refundedAmount || 0) + refundAmount;
    transaction.refundStatus = refundAmount === transaction.amount ? "full" : "partial";
    transaction.refundedAt = new Date();

    if (transaction.refundedAmount >= transaction.amount) {
      transaction.status = "refunded";
    }

    return {
      success: true,
      refundId,
      amount: refundAmount,
      status: transaction.refundStatus,
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return {
      status: transaction.status,
      details: {
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        cardBrand: transaction.cardBrand,
        last4: transaction.last4,
        createdAt: transaction.createdAt,
        refundedAmount: transaction.refundedAmount || 0,
      },
    };
  }

  /**
   * Validate payment method
   */
  async validatePaymentMethod(paymentMethodData) {
    const errors = [];

    // Validate card number
    const cardNumber =
      paymentMethodData.cardNumber ||
      paymentMethodData.number ||
      paymentMethodData.card?.number;

    if (!cardNumber) {
      errors.push("Card number is required");
    } else if (!this.validateCardNumber(cardNumber)) {
      errors.push("Invalid card number");
    }

    // Validate expiry
    const expiryMonth = paymentMethodData.expiryMonth || paymentMethodData.card?.exp_month;
    const expiryYear = paymentMethodData.expiryYear || paymentMethodData.card?.exp_year;

    if (!expiryMonth || !expiryYear) {
      errors.push("Expiry date is required");
    } else {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (
        expiryYear < currentYear ||
        (expiryYear === currentYear && expiryMonth < currentMonth)
      ) {
        errors.push("Card has expired");
      }
    }

    // Validate CVV
    const cvv = paymentMethodData.cvv || paymentMethodData.card?.cvc;
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      errors.push("Invalid CVV");
    }

    // Validate cardholder name
    const cardholderName =
      paymentMethodData.cardholderName || paymentMethodData.card?.name;
    if (!cardholderName || cardholderName.trim().length < 2) {
      errors.push("Cardholder name is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Save payment method (mock implementation)
   */
  async savePaymentMethod(paymentMethodData, userId) {
    // In a real implementation, this would tokenize the card with the payment provider
    // For mock, we just return a fake payment method ID
    const paymentMethodId = `pm_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      paymentMethodId,
      last4: paymentMethodData.cardNumber?.slice(-4) || "****",
      brand: this.getCardBrand(paymentMethodData.cardNumber || ""),
    };
  }
}

module.exports = MockPaymentService;

