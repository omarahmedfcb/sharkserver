const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { addProject } = require("../controllers/project/addproject.controller");
const {
  getAllProjects,
} = require("../controllers/project/getallprojects.controller");
const {
  getSingleProject,
} = require("../controllers/project/getsingleproject.controller");
const {
  getUserProjects,
} = require("../controllers/project/getuserprojects.controller");
const {
  deleteProject,
} = require("../controllers/project/deleteproject.controller");
const {
  removeProjectImage,
  updateProjectImage,
  upload,
} = require("../controllers/project/uploadimage.controller");
const {
  editProject,
} = require("../controllers/project/editproject.controller");
const multer = require("multer");

const router = express.Router();

// Configure multer for multiple file types
const uploadFields = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // For image field, accept only images
    if (file.fieldname === "image") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for image field"));
      }
    }
    // For documents field, accept only PDFs
    else if (file.fieldname === "documents") {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed for documents"));
      }
    }
    // Reject any other fields
    else {
      cb(new Error(`Unexpected field: ${file.fieldname}`));
    }
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "documents", maxCount: 3 },
]);

router.get("/", getAllProjects);
router.get("/:id", getSingleProject);
router.get("/user/:id", getUserProjects);
router.delete("/delete/:id", requireAuth, deleteProject);

router.post("/add", requireAuth, uploadFields, addProject);
router.put(
  "/:projectId/image",
  requireAuth,
  upload.single("image"),
  updateProjectImage
);
router.delete("/:projectId/image", requireAuth, removeProjectImage);
router.put("/edit/:id", requireAuth, uploadFields, editProject);

module.exports = router;
