const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { banUser } = require("../controllers/admin/banuser.controller");
const { unbanUser } = require("../controllers/admin/unbanuser.controller");
const {
  getUsersBanStatus,
} = require("../controllers/admin/getusersstatus.controller");
const { getAllUsers } = require("../controllers/admin/getAllUsers.controller");
const { getAllProjects } = require("../controllers/admin/getAllProjects.controller");
const { getAllBlogs } = require("../controllers/admin/getAllBlogs.controller");
const { getAllFAQs } = require("../controllers/admin/getAllFAQs.controller");
const { updateUser } = require("../controllers/admin/updateUser.controller");
const { deleteProject } = require("../controllers/admin/deleteProject.controller");

const router = express.Router();

// User management
router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.get("/users/ban-status", requireAuth, requireAdmin, getUsersBanStatus);
router.get("/ban/:id", requireAuth, requireAdmin, banUser);
router.get("/unban/:id", requireAuth, requireAdmin, unbanUser);
router.patch("/users/:id", requireAuth, requireAdmin, updateUser);

// Project management
router.get("/projects", requireAuth, requireAdmin, getAllProjects);
router.delete("/projects/:id", requireAuth, requireAdmin, deleteProject);

// Blog management
router.get("/blogs", requireAuth, requireAdmin, getAllBlogs);

// FAQ management
router.get("/faqs", requireAuth, requireAdmin, getAllFAQs);

module.exports = router;
