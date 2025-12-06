const logOut = async (req, res) => {
  try {
    // Determine cookie settings based on environment
    // For cross-origin (production): sameSite: "none" requires secure: true
    // For same-origin (localhost): sameSite: "lax" with secure: false
    const origin = req.headers.origin || req.headers.referer || '';
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    res.cookie("token", "", {
      httpOnly: true,
      secure: isSecure && !isLocalhost, // false for localhost, true for production
      sameSite: isLocalhost ? "lax" : "none",
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { logOut };
