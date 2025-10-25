const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const postsRoutes = require("./routers/posts.route.js");
const todosRoutes = require("./routers/todos.route.js");
const authRoutes = require("./routers/auth.route.js");
// const uploadRoutes = require("./routers/uploadpic.route.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

console.log("MONGO_URL:", process.env.MONGO_URL);
mongoose
  .connect(`${process.env.MONGO_URL}/${process.env.DB_NAME}`)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/posts", postsRoutes);
app.use("/todos", todosRoutes);
app.use("/auth", authRoutes);
// app.use("/upload", uploadRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
