import express from 'express';
import { sendMessage, updateMessageStatus, getMessages, markMessagesAsSeen, getLastMessages } from '../controllers/messageController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer';
const upload = multer();

const router = express.Router();

router.post('/send', authMiddleware, upload.single('file'),  sendMessage);
router.post('/seen', authMiddleware, markMessagesAsSeen); 
router.put('/status', authMiddleware, updateMessageStatus);
router.get('/last-messages', authMiddleware, getLastMessages); // Fetch last messages for all users
router.get('/:chatId', authMiddleware, getMessages);

export default router;