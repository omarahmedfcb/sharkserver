const express = require("express");
const router = express.Router();
const {
  createEntry,
  getAllEntries,
  getOneEntry,
  deleteEntry,
  updateEntry,
} = require("../controllers/todos.controller");

router.post("/", createEntry);

router.get("/", getAllEntries);

router.get("/:id", getOneEntry);

router.delete("/:id", deleteEntry);

router.put("/:id", updateEntry);

module.exports = router;
