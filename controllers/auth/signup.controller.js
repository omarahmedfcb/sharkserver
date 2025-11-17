const bcrypt = require("bcrypt");
const User = require("../../models/users");
const jwt = require("jsonwebtoken");
const {
  isValidEmail,
  isStrongPassword,
  normalizeName,
  sanitizeString,
} = require("../../utils/validators");

const ALLOWED_ACCOUNT_TYPES = ["investor", "owner", "admin"];

const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, accountType } = req.body;

    const normalizedFirstName = normalizeName(firstName || "");
    const normalizedLastName = normalizeName(lastName || "");
    const normalizedEmail = sanitizeString(email || "").toLowerCase();

    if (
      !normalizedFirstName ||
      !normalizedLastName ||
      !normalizedEmail ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (normalizedFirstName.length < 2 || normalizedLastName.length < 2) {
      return res.status(400).json({
        message: "First and last name must be at least 2 characters",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include one uppercase letter and one number",
      });
    }

    const type =
      accountType && ALLOWED_ACCOUNT_TYPES.includes(accountType)
        ? accountType
        : "investor";

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      accountType: type,
      banned,
    });

    const token = jwt.sign(
      {
        _id: newUser._id,
        email: newUser.email,
        accountType: newUser.accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NEXT_PUBLIC_SAME_SITE || "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        accountType: newUser.accountType,
      },
      message: "User Created Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signUp };
