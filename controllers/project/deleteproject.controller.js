const { Project } = require("../../models/projects");
const User = require("../../models/users");

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (
      project.owner.toString() !== userId.toString() &&
      req.user.accountType !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "You have no authority to delete this project",
      });
    }

    await Project.findByIdAndDelete(id);

    await User.findByIdAndUpdate(project.owner, {
      $pull: { ownedProjects: id },
    });

    await User.updateMany(
      { "investedProjects.project": id },
      { $pull: { investedProjects: { project: id } } }
    );

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
