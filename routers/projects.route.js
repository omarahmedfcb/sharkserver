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
const router = express.Router();

router.get("/", getAllProjects);
router.get("/:id", getSingleProject);
router.get("/user/:id", getUserProjects);
router.delete("/delete/:id", requireAuth, deleteProject);

router.post("/add", requireAuth, upload.single("image"), addProject);
router.put(
  "/:projectId/image",
  requireAuth,
  upload.single("image"),
  updateProjectImage
);
router.delete("/:projectId/image", requireAuth, removeProjectImage);
router.put("/edit/:id", requireAuth, upload.single("image"), editProject);

module.exports = router;
