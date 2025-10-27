
import Chat from '../models/chat.js';

export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.userId });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const chat = new Chat({
      userId: req.user.userId,
      ...req.body
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};