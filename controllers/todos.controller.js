const Todo = require("../models/todos");

const createEntry = async (req, res) => {
  const { title, completed } = req.body;
  await Todo.create({ title, completed });
  res.send("Entry Added");
};

const getAllEntries = async (req, res) => {
  const entries = await Todo.find();
  res.send(entries);
};

const getOneEntry = async (req, res) => {
  const { id } = req.params;
  const entry = await Todo.findById(id);
  res.send(entry);
};
const deleteEntry = async (req, res) => {
  const { id } = req.params;
  await Todo.findByIdAndDelete(id);
  res.send("Entry Deleted");
};

const updateEntry = async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  await Todo.findByIdAndUpdate(id, { title: title, completed: completed });
  res.send("Entry updated");
};
module.exports = {
  createEntry,
  getAllEntries,
  getOneEntry,
  deleteEntry,
  updateEntry,
};
