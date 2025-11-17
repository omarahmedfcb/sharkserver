/**
 * Payment Service Interface
 * Abstract interface for payment processing
 * Implementations: MockPaymentService, StripePaymentService, PaymobPaymentService
 */
class IPaymentService {
  /**
   * Create a payment intent
   * @param {number} amount - Payment amount
   * @param {string} currency - Currency code (USD, EGP, etc.)
   * @param {object} metadata - Additional metadata
   * @returns {Promise<{paymentIntentId: string, clientSecret: string}>}
   */
  async createPaymentIntent(amount, currency, metadata) {
    throw new Error("Method must be implemented");
  }

  /**
   * Confirm a payment
   * @param {string} paymentIntentId - Payment intent ID
   * @param {string|object} paymentMethodId - Payment method ID or data
   * @returns {Promise<{success: boolean, transactionId: string, status: string}>}
   */
  async confirmPayment(paymentIntentId, paymentMethodId) {
    throw new Error("Method must be implemented");
  }

  /**
   * Refund a payment
   * @param {string} transactionId - Transaction ID
   * @param {number} amount - Refund amount (optional, full refund if not provided)
   * @returns {Promise<{success: boolean, refundId: string, amount: number}>}
   */
  async refundPayment(transactionId, amount) {
    throw new Error("Method must be implemented");
  }

  /**
   * Get payment status
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<{status: string, details: object}>}
   */
  async getPaymentStatus(transactionId) {
    throw new Error("Method must be implemented");
  }

  /**
   * Validate payment method
   * @param {object} paymentMethodData - Payment method data
   * @returns {Promise<{valid: boolean, errors: array}>}
   */
  async validatePaymentMethod(paymentMethodData) {
    throw new Error("Method must be implemented");
  }

  /**
   * Save payment method for future use
   * @param {object} paymentMethodData - Payment method data
   * @param {string} userId - User ID
   * @returns {Promise<{paymentMethodId: string}>}
   */
  async savePaymentMethod(paymentMethodData, userId) {
    throw new Error("Method must be implemented");
  }
}

module.exports = IPaymentService;

