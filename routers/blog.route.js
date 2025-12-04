const express = require("express");
const { requireAuth, optionalAuth } = require("../middleware/auth");
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
const {
  likePost,
  unlikePost,
} = require("../controllers/blog/likepost.controller");
const {
  likeComment,
  unlikeComment,
} = require("../controllers/blog/likecomment.controller");
const {
  removePostImage,
  updatePostImage,
  upload,
} = require("../controllers/blog/uploadpostimage.controller");

const router = express.Router();
//dashboard
router.get("/user/posts", requireAuth, getUserPosts);
router.get("/user/comments", requireAuth, getUserComments);

router.get("/", optionalAuth, getAllPosts);
router.get("/post/:id", optionalAuth, getPostComments);

router.post("/post/add", requireAuth, upload.single("image"), addPost);
router.post("/comment/add", requireAuth, addComment);
router.post("/post/delete/:id", requireAuth, deletePost);
router.post("/comment/delete/:id", requireAuth, deleteComment);

//images
router.post(
  "/post/:postId/image",
  requireAuth,
  upload.single("image"),
  updatePostImage
);
router.delete("/post/:postId/image", requireAuth, removePostImage);

//likes
router.post("/like/post/:id", requireAuth, likePost);
router.delete("/like/post/:id", requireAuth, unlikePost);
router.post("/like/comment/:id", requireAuth, likeComment);
router.delete("/like/comment/:id", requireAuth, unlikeComment);
router.get("/:id", optionalAuth, getSinglePost);

module.exports = router;
