const { Project } = require("../../models/projects");

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (e) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = { deleteProject };
