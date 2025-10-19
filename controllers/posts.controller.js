const Post = require("../models/posts");

const createPost = async (req, res) => {
  const { title, body } = req.body;
  await Post.create({ title, body });
  res.send("Post Created");
};

const getAllPosts = async (req, res) => {
  const posts = await Post.find();
  res.send(posts);
};

const getOnePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  res.send(post);
};
const deletePost = async (req, res) => {
  const { id } = req.params;
  await Post.findByIdAndDelete(id);
  res.send("Post Deleted");
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;

  await Post.findByIdAndUpdate(id, { title: title, body: body });
  res.send("Post updated");
};
module.exports = {
  createPost,
  getAllPosts,
  getOnePost,
  deletePost,
  updatePost,
};
