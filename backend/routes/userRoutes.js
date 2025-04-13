import express from "express";
import { updateUser, getUser, deleteUser, getAllUsers, followUser, unfollowUser } from "../controllers/userController.js";
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUser);
router.patch('/:id', authMiddleware,updateUser);
router.delete("/:id", authMiddleware, deleteUser);

//follow && unfollow routes
router.post('/follow/:id', authMiddleware, followUser);
router.post('/unfollow/:userId', authMiddleware, unfollowUser);

export default router;
