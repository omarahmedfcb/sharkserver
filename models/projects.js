// models/Project.js
const mongoose = require("mongoose");

const PROJECT_CATEGORIES = {
  en: [
    "Technology",
    "E-Commerce",
    "Food",
    "Health",
    "Education",
    "Real Estate",
    "Industrial",
    "Other",
  ],
  ar: [
    "تكنولوجيا",
    "تجارة إلكترونية",
    "أطعمة",
    "صحة",
    "تعليم",
    "عقارات",
    "صناعي",
    "أخرى",
  ],
};

const STATUS = ["active", "closed"];

const investorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  percentage: { type: Number, required: true },
  investedAt: { type: Date, default: Date.now },
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const timelineSchema = new mongoose.Schema({
  phase: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["completed", "in-progress", "upcoming"],
    default: "upcoming",
  },
});

const managementTeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String },
  bio: { type: String },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDesc: { type: String, required: true },
    category: {
      en: { type: String, enum: PROJECT_CATEGORIES.en },
      ar: { type: String, enum: PROJECT_CATEGORIES.ar },
    },
    status: {
      type: String,
      enum: STATUS,
      required: true,
    },
    totalPrice: { type: Number, required: true },
    image: {
      type: String,
      default: "",
    },
    progress: { type: Number, default: 0 },

    // Project owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Investors are optional
    investors: { type: [investorSchema], required: false },

    // Percentage available for sale
    availablePercentage: { type: Number, default: 0 },

    // Optional business details
    expectedROI: { type: Number, required: true },
    potentialRisks: [{ type: String }],
    keyBenefits: [{ type: String }],

    // NEW: Documents and Timeline
    documents: {
      type: [documentSchema],
      validate: [
        (val) => val.length <= 3,
        "Maximum 3 documents allowed per project",
      ],
    },
    timeline: [timelineSchema],

    // Optional management team
    managementTeam: {
      type: [managementTeamSchema],
      required: false,
    },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = { Project, PROJECT_CATEGORIES };
