const User = require("../../models/users");

const getUserProjects = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate("ownedProjects")
      .populate("investedProjects.project");

    let userProjects = [];
    if (user.accountType == "owner") {
      userProjects = user.ownedProjects;
    } else if (user.accountType == "investor") {
      userProjects = user.investedProjects;
    }
    res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      userProjects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserProjects };
