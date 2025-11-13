const Comment = require("../../models/comments");

const getUserComments = async (req, res) => {
  try {
    const author = req.user._id;
    const userComments = await Comment.find({ author }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      userComments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { getUserComments };
