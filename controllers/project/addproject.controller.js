const { Project, PROJECT_CATEGORIES } = require("../../models/projects");
const User = require("../../models/users");
const { uploadProjectImage } = require("./uploadimage.controller");
const { uploadProjectDocument } = require("./uploaddocument.controller");

const addProject = async (req, res) => {
  try {
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
    } = req.body;

    // Parse arrays from JSON strings
    const potentialRisks = req.body.potentialRisks
      ? JSON.parse(req.body.potentialRisks)
      : [];
    const keyBenefits = req.body.keyBenefits
      ? JSON.parse(req.body.keyBenefits)
      : [];
    const timeline = req.body.timeline ? JSON.parse(req.body.timeline) : [];
    const documentTitles = req.body.documentTitles
      ? JSON.parse(req.body.documentTitles)
      : [];

    // Validation
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

    // Validate documents
    if (req.files && req.files.documents) {
      if (req.files.documents.length > 3) {
        return res.status(400).json({ message: "Maximum 3 documents allowed" });
      }
      if (req.files.documents.length !== documentTitles.length) {
        return res
          .status(400)
          .json({ message: "Each document must have a title" });
      }
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
      image: "",
      availablePercentage: availablePercentage
        ? Number(availablePercentage)
        : undefined,
      expectedROI: Number(expectedROI),
      potentialRisks,
      keyBenefits,
      timeline,
      documents: [],
    });

    // Upload main image if provided
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const imageUrl = await uploadProjectImage(
          req.files.image[0].buffer,
          newProject._id
        );
        newProject.image = imageUrl;
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
      }
    }

    // Upload documents if provided
    if (req.files && req.files.documents) {
      const uploadedDocuments = [];

      for (let i = 0; i < req.files.documents.length; i++) {
        try {
          const file = req.files.documents[i];
          const title = documentTitles[i];

          const fileUrl = await uploadProjectDocument(
            file.buffer,
            newProject._id,
            file.originalname
          );

          uploadedDocuments.push({
            title,
            fileUrl,
            uploadedAt: new Date(),
          });
        } catch (docError) {
          console.error("Error uploading document:", docError);
          // Continue with other documents
        }
      }

      newProject.documents = uploadedDocuments;
    }

    await newProject.save();

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
