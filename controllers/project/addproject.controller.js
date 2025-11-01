const { Project, PROJECT_CATEGORIES } = require("../../models/projects");
const User = require("../../models/users");

const addProject = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDesc,
      category,
      status,
      totalPrice,
      owner,
      image,
      availablePercentage,
      expectedROI,
      potentialRisks,
      keyBenefits,
      managementTeam,
    } = req.body;
    if (
      !title ||
      !description ||
      !totalPrice ||
      !owner ||
      !category ||
      !status ||
      !shortDesc
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (category.en && !category.ar) {
      const index = PROJECT_CATEGORIES.en.findIndex(
        (ele) => ele === category.en
      );
      if (index !== -1) {
        category.ar = PROJECT_CATEGORIES.ar[index];
      }
    } else if (!category.en && category.ar) {
      const index = PROJECT_CATEGORIES.ar.findIndex(
        (ele) => ele === category.ar
      );
      if (index !== -1) {
        category.en = PROJECT_CATEGORIES.en[index];
      }
    }

    const existingTitle = await Project.findOne({ title });
    if (existingTitle)
      return res.status(400).json({ message: "Title was used before" });

    if (availablePercentage && availablePercentage > 100) {
      return res
        .status(400)
        .json({ message: "Available percentage shouldn't exceed 100" });
    }
    if (expectedROI && expectedROI > 100) {
      return res.status(400).json({ message: "Invalid ROI" });
    }

    const newProject = await Project.create({
      title,
      description,
      shortDesc,
      status,
      category,
      totalPrice,
      owner,
      image,
      availablePercentage,
      expectedROI,
      potentialRisks,
      keyBenefits,
      managementTeam,
    });
    await User.findByIdAndUpdate(owner, {
      $push: { ownedProjects: newProject._id },
    });
    res.status(201).json({
      success: true,
      message: "Project added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addProject };
