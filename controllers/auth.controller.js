const bcrypt = require("bcryptjs");
const User = require("../models/users.js");

// ✅ تغيير كلمة المرور
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // جاي من verifyToken
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "الرجاء إدخال كل الحقول" });
    }

    // نجيب المستخدم من قاعدة البيانات
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    // نتحقق من الباسورد القديم
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة" });
    }

    // نعمل تشفير للباسورد الجديد
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};
