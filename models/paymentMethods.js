const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentMethodSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["card", "wallet", "bank_account"],
      required: true,
    },
    provider: {
      type: String,
      enum: ["stripe", "paymob", "paypal", "mock"],
      default: "mock",
    },
    last4: {
      type: String,
      required: function () {
        return this.type === "card";
      },
    },
    brand: {
      type: String,
      enum: ["Visa", "Mastercard", "American Express", "Discover", "Other"],
      required: function () {
        return this.type === "card";
      },
    },
    expiryMonth: {
      type: Number,
      min: 1,
      max: 12,
      required: function () {
        return this.type === "card";
      },
    },
    expiryYear: {
      type: Number,
      required: function () {
        return this.type === "card";
      },
    },
    cardholderName: {
      type: String,
      required: function () {
        return this.type === "card";
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    providerPaymentMethodId: {
      type: String,
      required: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one default payment method per user
paymentMethodSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    await mongoose
      .model("PaymentMethod")
      .updateMany(
        { userId: this.userId, _id: { $ne: this._id } },
        { isDefault: false }
      );
  }
  next();
});

// Indexes
paymentMethodSchema.index({ userId: 1, isActive: 1 });
paymentMethodSchema.index({ userId: 1, isDefault: 1 });

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
module.exports = { PaymentMethod };

