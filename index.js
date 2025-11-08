const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const authRoutes = require("./routers/auth.route.js");
const projectRoutes = require("./routers/projects.route.js");
const chatbotRoutes = require("./routers/chatbot.route.js");
const faqRoutes = require("./routers/faq.route.js");
const offersRoutes = require("./routers/offers.route.js");
const chatRoutes = require("./routers/chat.route.js");
const notificationsRoutes = require("./routers/notifications.route.js");
// const uploadRoutes = require("./routers/uploadpic.route.js");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const app = express();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", 1);
const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/faq", faqRoutes);
app.use("/offers", offersRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/chat", chatRoutes);
// app.use("/upload", uploadRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.conversationId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
