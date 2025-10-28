const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  title: String,
  body: String,
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
