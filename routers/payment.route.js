const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createPaymentIntent } = require("../controllers/payment/createPaymentIntent.controller");
const { confirmPayment } = require("../controllers/payment/confirmPayment.controller");
const { getPaymentStatus } = require("../controllers/payment/getPaymentStatus.controller");
const { refundPayment } = require("../controllers/payment/refundPayment.controller");
const { savePaymentMethod } = require("../controllers/payment/savePaymentMethod.controller");
const { getPaymentMethods } = require("../controllers/payment/getPaymentMethods.controller");
const { deletePaymentMethod } = require("../controllers/payment/deletePaymentMethod.controller");
const { getUserTransactions } = require("../controllers/payment/getUserTransactions.controller");

const router = express.Router();

// All payment routes require authentication
router.use(requireAuth);

// Payment intent routes
router.post("/intent", createPaymentIntent);
router.post("/confirm", confirmPayment);
router.get("/status/:transactionId", getPaymentStatus);
router.post("/refund", refundPayment);

// Payment methods routes
router.post("/methods", savePaymentMethod);
router.get("/methods", getPaymentMethods);
router.delete("/methods/:id", deletePaymentMethod);

// User transactions
router.get("/transactions", getUserTransactions);

module.exports = router;

