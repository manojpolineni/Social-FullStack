import express from 'express';
import { createOrGetChat, getUserChats } from '../controllers/chatController.js';
import authMiddleware from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post('/chats', authMiddleware, createOrGetChat);
router.get('/chats', authMiddleware, getUserChats);

export default router;