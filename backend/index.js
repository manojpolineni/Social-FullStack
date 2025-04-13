import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from "url";
import { initializeSocket } from "./socket.js";

import AuthRoutes from './routes/authRoutes.js';
import UserRoutes from './routes/userRoutes.js';
import PostRoutes from './routes/postRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import ChatRoutes from './routes/chatRoutes.js';
import MessagesRoutes from "./routes/messagesRoutes.js";

dotenv.config();

const { MONGO_URI } = process.env;
const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.io only once
const io = initializeSocket(server);

// ✅ Pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/postUploads", express.static(path.join(__dirname, "postUploads")));

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
// });

app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

//MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.json({ message: "User data retrieved successfully" });
});

//Routes
app.use('/api/auth', AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/post", PostRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/chat', ChatRoutes);
app.use('/api/messages', MessagesRoutes);

//Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
