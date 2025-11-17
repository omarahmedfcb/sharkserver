const { Project } = require("../../models/projects");
const User = require("../../models/users");

const deleteProject = async (req, res) => {
  try {
    if (req.user.accountType !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const { id } = req.params;

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Remove project from owner's ownedProjects
    await User.findByIdAndUpdate(project.owner, {
      $pull: { ownedProjects: id },
    });

    // Remove project from all investors' investedProjects
    if (project.investors && project.investors.length > 0) {
      const investorIds = project.investors.map(inv => inv.user);
      await User.updateMany(
        { _id: { $in: investorIds } },
        { $pull: { investedProjects: { project: id } } }
      );
    }

    // Delete project
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { deleteProject };

