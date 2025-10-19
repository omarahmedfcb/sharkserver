const bcrypt = require("bcrypt");
const User = require("../../models/users");
const jwt = require("jsonwebtoken");

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let isRightPassword = false;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const loggedUser = await User.findOne({ email });
    if (loggedUser) {
      isRightPassword = await bcrypt.compare(password, loggedUser.password);
    } else {
      return res.status(400).json({ message: "Email was not found" });
    }

    if (isRightPassword) {
      const token = jwt.sign(
        {
          id: loggedUser._id,
          email: loggedUser.email,
          accountType: loggedUser.accountType,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: loggedUser._id,
          firstName: loggedUser.firstName,
          lastName: loggedUser.lastName,
          email: loggedUser.email,
          accountType: loggedUser.accountType,
        },
        message: "User Logged in successfully",
      });
    } else {
      return res.status(400).json({ message: "Password is incorrect" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signIn };
