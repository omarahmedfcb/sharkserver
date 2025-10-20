const logOut = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NEXT_PUBLIC_SAME_SITE,
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
