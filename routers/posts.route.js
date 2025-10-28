const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getOnePost,
  deletePost,
  updatePost,
} = require("../controllers/posts.controller");

router.post("/", createPost);

router.get("/", getAllPosts);

router.get("/:id", getOnePost);

router.delete("/:id", deletePost);

router.put("/:id", updatePost);

module.exports = router;
