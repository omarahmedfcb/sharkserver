const Project = require("../../models/projects");

const getSingleProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      project,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getSingleProject };
