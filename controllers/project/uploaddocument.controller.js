const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const { Project } = require("../../models/projects");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const uploadProjectDocument = async (
  documentBuffer,
  projectId,
  originalName
) => {
  try {
    // Generate filename
    const timestamp = Date.now();
    const fileName = `${projectId}-${timestamp}-${originalName}`;
    const filePath = `project-documents/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from("project-documents")
      .upload(filePath, documentBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("project-documents").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading project document:", error);
    throw error;
  }
};

const deleteProjectDocument = async (documentUrl) => {
  try {
    const filePath = documentUrl.split("/").slice(-2).join("/");
    await supabase.storage.from("project-documents").remove([filePath]);
  } catch (error) {
    console.error("Error deleting project document:", error);
    throw error;
  }
};

module.exports = {
  documentUpload,
  uploadProjectDocument,
  deleteProjectDocument,
};
