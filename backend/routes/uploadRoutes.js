import express from "express";
import multer from "multer";
import {
  uploadProfileImage,
  uploadVideo,
  deleteVideo,
} from "../controllers/uploadController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.post("/profile", authMiddleware, upload.single("profilePic"), uploadProfileImage);
router.post("/video", authMiddleware, upload.single("video"), uploadVideo);
router.delete("/video/:filename", authMiddleware, deleteVideo);

export default router;
