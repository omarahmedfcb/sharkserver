const { Project } = require("../../models/projects");
const User = require("../../models/users");

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { ownedProjects: id },
    });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { deleteProject };
