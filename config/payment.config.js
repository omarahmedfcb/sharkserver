/**
 * Payment Configuration
 * Configure payment provider and settings
 */

const paymentConfig = {
  // Payment provider: 'mock', 'stripe', 'paymob', 'paypal'
  provider: process.env.PAYMENT_PROVIDER || "mock",

  // Test mode toggle
  testMode: process.env.PAYMENT_TEST_MODE !== "false",

  // Default currency
  defaultCurrency: process.env.PAYMENT_CURRENCY || "USD",

  // Supported currencies
  supportedCurrencies: ["USD", "EGP", "EUR"],

  // Payment processing delays (for mock)
  mockProcessingDelay: 2000, // 2 seconds

  // Test cards for mock service
  testCards: {
    success: "4242424242424242",
    decline: "4000000000000002",
    threeDSecure: "4000002500003155",
    insufficientFunds: "4000000000009995",
    expired: "4000000000000069",
    incorrectCvc: "4000000000000127",
  },

  // Provider API keys (for real providers)
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },

  paymob: {
    apiKey: process.env.PAYMOB_API_KEY || "",
    integrationId: process.env.PAYMOB_INTEGRATION_ID || "",
    iframeId: process.env.PAYMOB_IFRAME_ID || "",
  },

  // Fee calculation (platform fee percentage)
  platformFee: parseFloat(process.env.PLATFORM_FEE || "2.5"), // 2.5%

  // Minimum and maximum payment amounts
  minAmount: parseFloat(process.env.MIN_PAYMENT_AMOUNT || "10"),
  maxAmount: parseFloat(process.env.MAX_PAYMENT_AMOUNT || "1000000"),

  // Refund settings
  refundWindow: 30, // days
  allowPartialRefunds: true,
};

module.exports = paymentConfig;

