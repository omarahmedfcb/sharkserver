const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../../models/users");
const {
  normalizeName,
  isValidEmail,
} = require("../../utils/validators");

const ALLOWED_ACCOUNT_TYPES = ["investor", "owner", "admin"];

const buildOAuthClient = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"
  );

const googleAuth = async (req, res) => {
  try {
    const { code, accountType, intent } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({
        message: "Google OAuth is not configured. Contact support.",
      });
    }

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    const oauthClient = buildOAuthClient();
    const { tokens } = await oauthClient.getToken(code);

    if (!tokens?.id_token) {
      return res
        .status(400)
        .json({ message: "Failed to verify Google credentials" });
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        message: "Google account does not provide a valid email address",
      });
    }

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      if (intent !== "signup") {
        return res.status(404).json({
          message:
            "No account is linked to this Google email. Please register first.",
          needsAccountType: true,
        });
      }

      if (
        !accountType ||
        !ALLOWED_ACCOUNT_TYPES.includes(accountType.toLowerCase())
      ) {
        return res.status(400).json({
          message: "Select a valid account type to complete registration",
        });
      }

      const givenName =
        payload?.given_name ||
        payload?.name?.split(" ")?.[0] ||
        "Google";
      const familyName =
        payload?.family_name ||
        payload?.name?.split(" ")?.slice(1).join(" ") ||
        "User";

      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        firstName: normalizeName(givenName),
        lastName: normalizeName(familyName),
        email,
        password: hashedPassword,
        accountType: accountType.toLowerCase(),
        profilePicUrl: payload?.picture,
      });
      isNewUser = true;
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        accountType: user.accountType,
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

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        profilePicUrl: user.profilePicUrl,
        banned: user.banned,
      },
      message: isNewUser
        ? "Account created with Google successfully"
        : "Signed in with Google",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

module.exports = { googleAuth };

