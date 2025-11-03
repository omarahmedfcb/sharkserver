const mongoose = require("mongoose");
const { Schema } = mongoose;
const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "offer_sent",
        "offer_accepted",
        "offer_rejected",
        "offer_cancelled",
      ],
    },

    message: { type: String, required: true },
    link: { type: String, default: "/account/offers" },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = { Notification };
