const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getInvestorDashboard } = require("../controllers/dashboard/investor.controller");
const { getOwnerDashboard } = require("../controllers/dashboard/owner.controller");
const { getAdminDashboard } = require("../controllers/dashboard/admin.controller");

const router = express.Router();

// Get investor dashboard data
router.get("/investor", requireAuth, getInvestorDashboard);

// Get owner dashboard data
router.get("/owner", requireAuth, getOwnerDashboard);

// Get admin dashboard data
router.get("/admin", requireAuth, getAdminDashboard);

module.exports = router;

