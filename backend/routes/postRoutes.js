import express from 'express';
import { createPost, getPost, getUserPosts, deletePost, likePost, commentOnPost, deleteSingleComment, deleteAllComments } from '../controllers/postController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import fs from "fs";
import multer from 'multer';

const router = express.Router();

const uploadDir = "postUploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 10MB limit
});


router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createPost
);
router.get('/', authMiddleware, getPost);
router.get('/user', authMiddleware, getUserPosts);
router.delete('/:id', authMiddleware, deletePost);
router.post('/like/:id', authMiddleware, likePost);
router.post('/comment/:id', authMiddleware, commentOnPost);
router.delete('/:postId/comments/:commentId', authMiddleware, deleteSingleComment);
router.delete('/:postId/comments', authMiddleware, deleteAllComments);

export default router;