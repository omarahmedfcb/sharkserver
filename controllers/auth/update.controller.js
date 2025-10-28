const User = require("../../models/users");

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    // تأكد من وجود المستخدم من الـ token
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // تحديث البيانات
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (email) user.email = email; // ممكن تلغيها لو البريد ما يتغيرش

    // تحديث الصورة (لو موجودة)
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      user.profilePicUrl = imageUrl;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateProfile };
