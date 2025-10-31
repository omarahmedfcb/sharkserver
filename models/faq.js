const mongoose = require("mongoose");
const { Schema } = mongoose;

const faqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    questionAr: {
      type: String,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    answerAr: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "features", "projects", "categories", "account", "security", "usage"],
      default: "general",
    },
    keywords: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      enum: ["ar", "en", "both"],
      default: "both",
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for better search performance
faqSchema.index({ question: "text", keywords: "text" });
faqSchema.index({ category: 1 });
faqSchema.index({ language: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);
module.exports = FAQ;

