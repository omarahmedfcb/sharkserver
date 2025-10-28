const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  profilePicUrl: String,
  accountType: {
    type: String,
    enum: ["investor", "owner", "admin"],
    default: "investor",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  ownedProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
  investedProjects: [
    {
      project: { type: Schema.Types.ObjectId, ref: "Project" },
      percentage: { type: Number, required: true },
      amount: { type: Number, required: true },
      investedAt: { type: Date, default: Date.now },
    },
  ],
});
const User = mongoose.model("User", userSchema);
module.exports = User;
