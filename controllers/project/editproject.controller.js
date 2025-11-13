const { Project, PROJECT_CATEGORIES } = require("../../models/projects");
const { uploadProjectImage } = require("./uploadimage.controller");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const editProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the project with investors populated
    const project = await Project.findById(id).populate("investors.user");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is the owner
    if (
      project.owner.toString() !== req.user._id.toString() &&
      req.user.accountType !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You don't own this project" });
    }

    // Calculate total invested percentage
    const totalInvestedPercentage = project.investors.reduce(
      (sum, investor) => {
        return sum + investor.percentage;
      },
      0
    );

    // Calculate maximum available percentage (100 - invested)
    const maxAvailablePercentage = 100 - totalInvestedPercentage;

    // Parse the category JSON string if it exists
    let category = null;
    if (req.body.category) {
      try {
        category = JSON.parse(req.body.category);
      } catch (e) {
        return res.status(400).json({ message: "Invalid category format" });
      }
    }

    const {
      title,
      description,
      shortDesc,
      status,
      totalPrice,
      availablePercentage,
      expectedROI,
      potentialRisks,
      keyBenefits,
      managementTeam,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !totalPrice ||
      !category ||
      !status ||
      !shortDesc
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if title is being changed to an existing title
    if (title !== project.title) {
      const existingTitle = await Project.findOne({ title });
      if (existingTitle) {
        return res
          .status(400)
          .json({ message: "Title is already used by another project" });
      }
    }

    // Category processing
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

    // Validate available percentage against invested amount
    if (availablePercentage !== undefined && availablePercentage !== "") {
      const newAvailablePercentage = Number(availablePercentage);

      if (newAvailablePercentage > 100) {
        return res.status(400).json({
          message: "Available percentage can't exceed 100%",
        });
      }

      if (newAvailablePercentage > maxAvailablePercentage) {
        return res.status(400).json({
          message: `Available percentage can't exceed ${maxAvailablePercentage.toFixed(
            2
          )}% because ${totalInvestedPercentage.toFixed(
            2
          )}% is already invested`,
          maxAvailable: maxAvailablePercentage,
          alreadyInvested: totalInvestedPercentage,
        });
      }
    }

    // Validate ROI
    if (expectedROI && Number(expectedROI) > 100) {
      return res.status(400).json({ message: "Invalid ROI" });
    }

    // Update project fields
    project.title = title;
    project.description = description;
    project.shortDesc = shortDesc;
    project.status = status;
    project.category = category;
    project.totalPrice = Number(totalPrice);
    project.expectedROI = Number(expectedROI);

    // Update optional fields
    if (availablePercentage !== undefined && availablePercentage !== "") {
      project.availablePercentage = Number(availablePercentage);
    }
    if (potentialRisks) {
      project.potentialRisks = potentialRisks;
    }
    if (keyBenefits) {
      project.keyBenefits = keyBenefits;
    }
    if (managementTeam) {
      project.managementTeam = managementTeam;
    }

    // Handle image update if new image is provided
    if (req.file) {
      try {
        // Delete old image if exists
        if (project.image) {
          const oldPath = project.image.split("/").slice(-2).join("/");
          await supabase.storage.from("project-images").remove([oldPath]);
        }

        // Upload new image
        const imageUrl = await uploadProjectImage(req.file.buffer, project._id);
        project.image = imageUrl;
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        // Continue without updating image
      }
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      projectId: project._id,
    });
  } catch (err) {
    console.error("Error in editProject:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = { editProject };
