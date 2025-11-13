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
const { getUserPosts } = require("../controllers/blog/getuserposts.controller");
const {
  getUserComments,
} = require("../controllers/blog/getusercomments.controller");

const router = express.Router();
//dashboard
router.get("/user/posts", requireAuth, getUserPosts);
router.get("/user/comments", requireAuth, getUserComments);

router.get("/", getAllPosts);
router.get("/post/:id", getPostComments);

router.post("/post/add", requireAuth, addPost);
router.post("/comment/add", requireAuth, addComment);
router.post("/post/delete/:id", requireAuth, deletePost);
router.post("/comment/delete/:id", requireAuth, deleteComment);
router.get("/:id", getSinglePost);

module.exports = router;
