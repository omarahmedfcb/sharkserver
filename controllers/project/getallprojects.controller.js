const { Project } = require("../../models/projects");

const getAllProjects = async (req, res) => {
  try {
    const allProjects = await Project.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      allProjects,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllProjects };
