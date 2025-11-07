const { Project, PROJECT_CATEGORIES } = require("../../models/projects");
const User = require("../../models/users");
const { uploadProjectImage } = require("./uploadimage.controller");

const addProject = async (req, res) => {
  try {
    // Parse the category JSON string
    const category = req.body.category ? JSON.parse(req.body.category) : null;

    const {
      title,
      description,
      shortDesc,
      status,
      totalPrice,
      owner,
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

    if (availablePercentage && Number(availablePercentage) > 100) {
      return res
        .status(400)
        .json({ message: "Available percentage shouldn't exceed 100" });
    }
    if (expectedROI && Number(expectedROI) > 100) {
      return res.status(400).json({ message: "Invalid ROI" });
    }

    // Create project first
    const newProject = await Project.create({
      title,
      description,
      shortDesc,
      status,
      category,
      totalPrice: Number(totalPrice),
      owner,
      image: "", // Empty initially
      availablePercentage: availablePercentage
        ? Number(availablePercentage)
        : undefined,
      expectedROI: Number(expectedROI),
      potentialRisks,
      keyBenefits,
      managementTeam,
    });

    // Upload image if provided
    if (req.file) {
      try {
        const imageUrl = await uploadProjectImage(
          req.file.buffer,
          newProject._id
        );
        newProject.image = imageUrl;
        await newProject.save();
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        // Continue without image - it's optional
      }
    }

    await User.findByIdAndUpdate(owner, {
      $push: { ownedProjects: newProject._id },
    });

    res.status(201).json({
      success: true,
      message: "Project added successfully",
      newProjectId: newProject._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addProject };
