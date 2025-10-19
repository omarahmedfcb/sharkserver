const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  accountType: {
    type: String,
    enum: ["investor", "project owner", "admin"],
    default: "investor",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
