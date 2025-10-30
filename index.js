const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoutes = require("./routers/auth.route.js");
const projectRoutes = require("./routers/projects.route.js");
// const uploadRoutes = require("./routers/uploadpic.route.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));


app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

console.log("MONGO_URL:", process.env.MONGO_URL);
mongoose
  .connect(`${process.env.MONGO_URL}/${process.env.DB_NAME}`)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
// app.use("/upload", uploadRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
