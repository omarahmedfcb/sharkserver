const jwt = require("jsonwebtoken");
const User = require("../models/users");

const requireAuth = async (req, res, next) => {
  try {
    // get token for web or mobile-
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    // if not found return error
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch user from DB
    const userFromDb = await User.findById(decoded.id).select(
      "firstName lastName email accountType"
    );

    if (!userFromDb) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: userFromDb._id,
      firstName: userFromDb.firstName,
      lastName: userFromDb.lastName,
      email: userFromDb.email,
      accountType: userFromDb.accountType,
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { requireAuth };
