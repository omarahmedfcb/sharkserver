// models/Project.js
const mongoose = require("mongoose");

const PROJECT_CATEGORIES = [
  "Technology",
  "E-Commerce",
  "Food",
  "Health",
  "Education",
  "Real Estate",
  "Industrial",
  "Other",
];

const STATUS = ["active", "closed"];

const managementTeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String },
});

const investorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  percentage: { type: Number, required: true },
  investedAt: { type: Date, default: Date.now },
});

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completion: { type: Number, required: true },
  description: { type: String, required: true },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDesc: { type: String, required: true },
    category: {
      type: String,
      enum: PROJECT_CATEGORIES,
      required: true,
    },
    status: {
      type: String,
      enum: STATUS,
      required: true,
    },
    totalPrice: { type: Number, required: true },
    images: [
      {
        type: String,
        default: "",
      },
    ],
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
    expectedROI: { type: Number, required: true }, // e.g., 12.5
    potentialRisks: [{ type: String }], // list of risks
    keyBenefits: [{ type: String }], // list of benefits
    milestones: {
      type: [milestoneSchema],
      required: false,
    },

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
module.exports = Project;
