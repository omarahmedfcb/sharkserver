const User = require("../../models/users");
const {
  normalizeName,
  sanitizeString,
} = require("../../utils/validators");

const MAX_BIO_LENGTH = 500;

const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const { firstName, lastName, company, phone, bio } = req.body;

    if (firstName !== undefined) {
      const normalized = normalizeName(firstName);
      if (!normalized || normalized.length < 2) {
        return res.status(400).json({ message: "First name must be at least 2 characters." });
      }
      updates.firstName = normalized;
    }

    if (lastName !== undefined) {
      const normalized = normalizeName(lastName);
      if (!normalized || normalized.length < 2) {
        return res.status(400).json({ message: "Last name must be at least 2 characters." });
      }
      updates.lastName = normalized;
    }

    if (company !== undefined) {
      updates.company = sanitizeString(company).slice(0, 120);
    }

    if (phone !== undefined) {
      const digitsOnly = sanitizeString(phone).replace(/[^\d+()\s-]/g, "");
      updates.phone = digitsOnly.slice(0, 40);
    }

    if (bio !== undefined) {
      const cleanedBio = sanitizeString(bio).slice(0, MAX_BIO_LENGTH);
      updates.bio = cleanedBio;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select(
      "firstName lastName email profilePicUrl accountType company phone bio ownedProjects investedProjects"
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateProfile };

