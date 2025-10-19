const bcrypt = require("bcrypt");
const User = require("../../models/users");
const jwt = require("jsonwebtoken");

const ALLOWED_ACCOUNT_TYPES = ["investor", "owner", "admin"];

const signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, accountType } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const type =
      accountType && ALLOWED_ACCOUNT_TYPES.includes(accountType)
        ? accountType
        : "investor";

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: type,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        accountType: newUser.accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
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
