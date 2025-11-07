const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const { Project } = require("../../models/projects");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for project images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const uploadProjectImage = async (imageBuffer, projectId) => {
  try {
    // Generate filename
    const fileName = `${projectId}-${Date.now()}.jpg`;
    const filePath = `project-images/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("project-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading project image:", error);
    throw error;
  }
};

const updateProjectImage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get project to check ownership and old image
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Upload new image
    const publicUrl = await uploadProjectImage(file.buffer, projectId);

    // Delete old image if exists
    if (project.image) {
      const oldPath = project.image.split("/").slice(-2).join("/");
      await supabase.storage.from("project-images").remove([oldPath]);
    }

    // Update project
    project.image = publicUrl;
    await project.save();

    res.status(200).json({
      message: "Project image updated successfully",
      success: true,
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error("Error updating project image:", error);
    res.status(500).json({ error: "Failed to update project image" });
  }
};

const removeProjectImage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!project.image) {
      return res.status(400).json({ error: "No project image to remove" });
    }

    // Delete from Supabase
    const filePath = project.image.split("/").slice(-2).join("/");
    await supabase.storage.from("project-images").remove([filePath]);

    // Update project
    project.image = "";
    await project.save();

    res.status(200).json({
      message: "Project image removed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error removing project image:", error);
    res.status(500).json({ error: "Failed to remove project image" });
  }
};

module.exports = {
  upload,
  uploadProjectImage,
  updateProjectImage,
  removeProjectImage,
};
