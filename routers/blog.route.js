const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getAllPosts } = require("../controllers/blog/getallposts.controller");
const { addPost } = require("../controllers/blog/addpost.controller");
const { addComment } = require("../controllers/blog/addcomment.controller");
const {
  getPostComments,
} = require("../controllers/blog/getpostcomments.controller");
const { deletePost } = require("../controllers/blog/deletepost.controller");
const {
  deleteComment,
} = require("../controllers/blog/deletecomment.controller");
const {
  getSinglePost,
} = require("../controllers/blog/getsinglepost.controller");

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getSinglePost);
router.get("/post/:id", getPostComments);

router.post("/post/add", requireAuth, addPost);
router.post("/comment/add", requireAuth, addComment);
router.post("/post/delete/:id", requireAuth, deletePost);
router.post("/comment/delete/:id", requireAuth, deleteComment);

module.exports = router;
