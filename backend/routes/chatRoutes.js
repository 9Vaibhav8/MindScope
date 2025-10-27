
import express from 'express';
import { getChats, createChat, updateChat } from '../controller/chatController.js';
import { verifyGoogleAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyGoogleAuth, getChats);
router.post('/', verifyGoogleAuth, createChat);
router.put('/:id', verifyGoogleAuth, updateChat);

export default router;