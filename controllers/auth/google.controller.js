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
    const { code, idToken, accountType, intent } = req.body;

    console.log("🔵 [Google Auth] Request received");
    console.log("🔵 [Google Auth] Intent:", intent);
    console.log("🔵 [Google Auth] Account type:", accountType);
    console.log("🔵 [Google Auth] Code present:", !!code);
    console.log("🔵 [Google Auth] idToken present:", !!idToken);

    // Check environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("🔴 [Google Auth] ERROR: Missing Google OAuth configuration");
      console.error("🔴 [Google Auth] GOOGLE_CLIENT_ID:", !!process.env.GOOGLE_CLIENT_ID);
      console.error("🔴 [Google Auth] GOOGLE_CLIENT_SECRET:", !!process.env.GOOGLE_CLIENT_SECRET);
      return res.status(500).json({
        success: false,
        message: "Google OAuth is not configured. Contact support.",
        error: "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET",
      });
    }

    // Require either an authorization code (web) or an idToken (mobile)
    if (!code && !idToken) {
      console.error("🔴 [Google Auth] ERROR: Missing authorization code or idToken");
      return res.status(400).json({
        success: false,
        message: "Missing authorization code or idToken",
      });
    }

    console.log("🔵 [Google Auth] Building OAuth client...");
    const oauthClient = buildOAuthClient();
    console.log(
      "🔵 [Google Auth] OAuth client ID:",
      process.env.GOOGLE_CLIENT_ID.substring(0, 20) + "..."
    );

    // Decide which idToken to verify
    let idTokenToVerify;

    if (code) {
      // Web flow: exchange authorization code for tokens
      console.log("🔵 [Google Auth] Exchanging code for tokens (web flow)...");
      let tokens;
      try {
        const tokenResponse = await oauthClient.getToken(code);
        tokens = tokenResponse.tokens;
        console.log("🔵 [Google Auth] Tokens received");
      } catch (tokenError) {
        console.error("🔴 [Google Auth] ERROR: Failed to exchange code for tokens");
        console.error("🔴 [Google Auth] Error details:", tokenError.message);
        console.error("🔴 [Google Auth] Full error:", tokenError);

        let errorMessage = "فشل التحقق من رمز التخويل";
        if (tokenError.message?.includes("invalid_grant")) {
          errorMessage =
            "رمز التخويل غير صالح أو منتهي الصلاحية. يرجى المحاولة مرة أخرى";
        } else if (tokenError.message?.includes("invalid_client")) {
          errorMessage = "خطأ في تكوين Google OAuth. يرجى الاتصال بالدعم";
        }

        return res.status(400).json({
          success: false,
          message: errorMessage,
          error: tokenError.message || "Token exchange failed",
        });
      }

      if (!tokens?.id_token) {
        console.error("🔴 [Google Auth] ERROR: No ID token in response");
        console.error(
          "🔴 [Google Auth] Tokens received:",
          Object.keys(tokens || {})
        );
        return res.status(400).json({
          success: false,
          message: "فشل التحقق من بيانات Google",
          error: "Missing ID token",
        });
      }

      idTokenToVerify = tokens.id_token;
    } else {
      // Mobile flow: use idToken directly from client
      console.log("🔵 [Google Auth] Using idToken from client (mobile flow)...");
      idTokenToVerify = idToken;
    }

    console.log("🔵 [Google Auth] Verifying ID token...");
    let ticket;
    try {
      ticket = await oauthClient.verifyIdToken({
        idToken: idTokenToVerify,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("🔵 [Google Auth] ID token verified");
    } catch (verifyError) {
      console.error("🔴 [Google Auth] ERROR: Failed to verify ID token");
      console.error("🔴 [Google Auth] Error details:", verifyError.message);
      console.error("🔴 [Google Auth] Full error:", verifyError);

      return res.status(400).json({
        success: false,
        message: "فشل التحقق من هوية Google",
        error: verifyError.message || "ID token verification failed",
      });
    }

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();

    console.log("🔵 [Google Auth] Email from payload:", email);

    if (!email || !isValidEmail(email)) {
      console.error("🔴 [Google Auth] ERROR: Invalid or missing email");
      console.error("🔴 [Google Auth] Payload email:", payload?.email);
      return res.status(400).json({
        success: false,
        message: "حساب Google لا يوفر عنوان بريد إلكتروني صالح",
        error: "Invalid email from Google account",
      });
    }

    console.log("🔵 [Google Auth] Checking for existing user...");
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      console.log("🔵 [Google Auth] User not found, creating new account...");
      
      if (intent !== "signup") {
        console.log("🔴 [Google Auth] ERROR: User not found but intent is not signup");
        return res.status(404).json({
          success: false,
          message: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني. يرجى التسجيل أولاً",
          needsAccountType: true,
        });
      }

      if (
        !accountType ||
        !ALLOWED_ACCOUNT_TYPES.includes(accountType.toLowerCase())
      ) {
        console.error("🔴 [Google Auth] ERROR: Invalid account type");
        console.error("🔴 [Google Auth] Provided account type:", accountType);
        return res.status(400).json({
          success: false,
          message: "يرجى اختيار نوع حساب صالح لإتمام التسجيل",
          error: "Invalid account type",
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

      console.log("🔵 [Google Auth] Creating user with name:", givenName, familyName);

      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      try {
        user = await User.create({
          firstName: normalizeName(givenName),
          lastName: normalizeName(familyName),
          email,
          password: hashedPassword,
          accountType: accountType.toLowerCase(),
          profilePicUrl: payload?.picture,
        });
        isNewUser = true;
        console.log("✅ [Google Auth] User created successfully:", user._id);
      } catch (createError) {
        console.error("🔴 [Google Auth] ERROR: Failed to create user");
        console.error("🔴 [Google Auth] Error details:", createError.message);
        console.error("🔴 [Google Auth] Full error:", createError);
        
        if (createError.code === 11000) {
          return res.status(409).json({
            success: false,
            message: "البريد الإلكتروني مسجل بالفعل",
            error: "Email already exists",
          });
        }
        
        return res.status(500).json({
          success: false,
          message: "فشل إنشاء الحساب. يرجى المحاولة مرة أخرى",
          error: createError.message || "User creation failed",
        });
      }
    } else {
      console.log("🔵 [Google Auth] Existing user found:", user._id);
    }

    console.log("🔵 [Google Auth] Generating JWT token...");
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

    console.log("✅ [Google Auth] Success! User:", user.email, "New user:", isNewUser);

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
        ? "تم إنشاء الحساب بنجاح باستخدام Google"
        : "تم تسجيل الدخول بنجاح باستخدام Google",
    });
  } catch (err) {
    console.error("🔴 [Google Auth] UNEXPECTED ERROR:");
    console.error("🔴 [Google Auth] Error message:", err.message);
    console.error("🔴 [Google Auth] Error stack:", err.stack);
    console.error("🔴 [Google Auth] Full error:", err);
    
    res.status(500).json({
      success: false,
      message: "فشل المصادقة مع Google. يرجى المحاولة مرة أخرى",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = { googleAuth };

