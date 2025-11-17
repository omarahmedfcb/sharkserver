const mongoose = require("mongoose");
const { Schema } = mongoose;

const offerSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  offeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  offeredTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
  percentage: { type: Number, required: true },
  amount: { type: Number, required: true },
  proposalLetter: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending",
  },
  paymentIntentId: { type: String, required: false },
  transactionId: { type: String, required: false },
  paymentStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    required: false,
  },
  createdAt: { type: Date, default: Date.now },
});

const Offer = mongoose.model("Offer", offerSchema);
module.exports = { Offer };
