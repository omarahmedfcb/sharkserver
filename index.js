const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const postsRoutes = require("./routers/posts.route.js");
const todosRoutes = require("./routers/todos.route.js");
const authRoutes = require("./routers/auth.route.js");
// const cors = require("cors");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
console.log("MONGO_URL:", process.env.MONGO_URL);
mongoose
  .connect(`${process.env.MONGO_URL}/${process.env.DB_NAME}`)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// const corsOptions = {
//   origin: "http://127.0.0.1:5500",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true,
// };
// app.use(cors(corsOptions));
app.use("/posts", postsRoutes);
app.use("/todos", todosRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
