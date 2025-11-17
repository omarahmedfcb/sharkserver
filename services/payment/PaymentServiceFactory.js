const paymentConfig = require("../../config/payment.config");
const MockPaymentService = require("./MockPaymentService");

/**
 * Payment Service Factory
 * Returns the appropriate payment service based on configuration
 */
class PaymentServiceFactory {
  static getPaymentService() {
    switch (paymentConfig.provider) {
      case "mock":
        return new MockPaymentService();
      case "stripe":
        // TODO: Implement StripePaymentService
        // const StripePaymentService = require("./StripePaymentService");
        // return new StripePaymentService();
        throw new Error("Stripe payment service not yet implemented");
      case "paymob":
        // TODO: Implement PaymobPaymentService
        // const PaymobPaymentService = require("./PaymobPaymentService");
        // return new PaymobPaymentService();
        throw new Error("Paymob payment service not yet implemented");
      default:
        return new MockPaymentService();
    }
  }
}

module.exports = PaymentServiceFactory;

