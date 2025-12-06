const bcrypt = require("bcrypt");
const User = require("../../models/users");
const jwt = require("jsonwebtoken");
const { isValidEmail, sanitizeString } = require("../../utils/validators");

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let isRightPassword = false;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = sanitizeString(email).toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const loggedUser = await User.findOne({ email: normalizedEmail });
    if (loggedUser) {
      isRightPassword = await bcrypt.compare(password, loggedUser.password);
    }
    if (loggedUser.banned) {
      return res.status(401).json({ message: "This user is banned" });
    }

    if (isRightPassword) {
      const token = jwt.sign(
        {
          _id: loggedUser._id,
          email: loggedUser.email,
          accountType: loggedUser.accountType,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Determine cookie settings based on environment
      // For cross-origin (production): sameSite: "none" requires secure: true
      // For same-origin (localhost): sameSite: "lax" with secure: false
      const origin = req.headers.origin || req.headers.referer || '';
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
      
      res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure && !isLocalhost, // false for localhost, true for production
        sameSite: isLocalhost ? "lax" : "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        token,
        user: {
          _id: loggedUser._id,
          firstName: loggedUser.firstName,
          lastName: loggedUser.lastName,
          email: loggedUser.email,
          accountType: loggedUser.accountType,
          profilePicUrl: loggedUser.profilePicUrl,
          banned: loggedUser.banned,
        },
        message: "User Logged in successfully",
      });
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signIn };
