const express = require("express");
const router = express.Router();
const { addFAQ } = require("../controllers/faq/addfaq.controller");
const { getFAQs, getFAQById } = require("../controllers/faq/getfaqs.controller");
const { updateFAQ } = require("../controllers/faq/updatefaq.controller");
const { deleteFAQ } = require("../controllers/faq/deletefaq.controller");

// CRUD routes for FAQ
router.post("/", addFAQ);
router.get("/", getFAQs);
router.get("/:id", getFAQById);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

module.exports = router;

