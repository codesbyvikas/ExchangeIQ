const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const authCheck = require('../middlewares/auth');

// Input validation helper functions
const validateMessage = (text, mediaUrl, mediaType) => {
  const errors = [];

  if (text && typeof text !== 'string') {
    errors.push('Message text must be a string');
  }

  if (text && text.trim().length > 1000) {
    errors.push('Message text must be less than 1000 characters');
  }

  if (mediaUrl && !isValidUrl(mediaUrl)) {
    errors.push('Invalid media URL');
  }

  if (mediaType && !['image', 'video', 'audio', 'document'].includes(mediaType)) {
    errors.push('Invalid media type');
  }

  return errors;
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Helper function to format chat for response
const formatChatForUser = (chat, userId) => {
  const otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());

  return {
    id: chat._id,
    name: otherParticipant?.name || 'Unknown User',
    photo: otherParticipant?.photo || null,
    skill: chat.skillInvolved ?
      `${chat.chatType.charAt(0).toUpperCase() + chat.chatType.slice(1)}: ${chat.skillInvolved.name}` :
      'General Chat',
    messages: chat.messages.map(msg => ({
      id: msg._id,
      sender: msg.sender._id.toString() === userId.toString() ? 'you' : 'them',
      text: msg.text || '',
      mediaUrl: msg.mediaUrl || null,
      mediaType: msg.mediaType || null,
      timestamp: msg.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullTimestamp: msg.timestamp.toISOString(),
      isRead: msg.isRead
    })),
    lastMessage: chat.lastMessage,
    chatType: chat.chatType,
    skillInvolved: chat.skillInvolved,
    unreadCount: chat.messages.filter(msg =>
      msg.sender.toString() !== userId.toString() && !msg.isRead
    ).length
  };
};

// Get all chats for a user
router.get('/', authCheck, async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      participants: userId
    })
      .populate('participants', 'name photo')
      .populate('skillInvolved', 'name')
      .populate('messages.sender', 'name')
      .sort({ lastMessage: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalChats = await Chat.countDocuments({
      participants: userId
    });

    const formattedChats = chats.map(chat => formatChatForUser(chat, userId));

    res.json({
      chats: formattedChats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalChats / limit),
        totalChats,
        hasNext: page < Math.ceil(totalChats / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({
      message: 'Failed to fetch chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send a message
router.post('/:chatId/message', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, mediaUrl, mediaType, publicId } = req.body;
    const userId = req.user._id;

    // Validate input
    const validationErrors = validateMessage(text, mediaUrl, mediaType);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Validate that either text or media is provided
    if (!text?.trim() && !mediaUrl) {
      return res.status(400).json({
        message: 'Either text or media must be provided'
      });
    }

    // Find and validate chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Create new message
    const newMessage = {
      sender: userId,
      text: text?.trim() || '',
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      publicId: publicId || null,
      timestamp: new Date(),
      isRead: false
    };

    // Add message and update chat
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate sender info for response
    await chat.populate('messages.sender', 'name');
    const addedMessage = chat.messages[chat.messages.length - 1];

    const responseMessage = {
      id: addedMessage._id,
      sender: addedMessage.sender._id.toString() === userId.toString() ? 'you' : 'them',
      text: addedMessage.text,
      mediaUrl: addedMessage.mediaUrl,
      mediaType: addedMessage.mediaType,
      timestamp: addedMessage.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullTimestamp: addedMessage.timestamp.toISOString(),
      isRead: addedMessage.isRead
    };

    res.status(201).json(responseMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Mark messages as read
router.patch('/:chatId/read', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark all messages not sent by current user as read
    let markedCount = 0;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== userId.toString() && !message.isRead) {
        message.isRead = true;
        markedCount++;
      }
    });

    if (markedCount > 0) {
      await chat.save();
    }

    res.json({
      message: 'Messages marked as read',
      markedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      message: 'Failed to mark messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get specific chat details with message pagination
router.get('/:chatId', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name photo')
      .populate('skillInvolved', 'name')
      .populate('messages.sender', 'name');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Paginate messages (newest first)
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = Math.max(0, totalMessages - ((page - 1) * limit));
    const paginatedMessages = chat.messages.slice(startIndex, endIndex);

    // Create a temporary chat object for formatting
    const chatForFormat = {
      ...chat.toObject(),
      messages: paginatedMessages
    };

    const formattedChat = formatChatForUser(chatForFormat, userId);

    // Add pagination info
    formattedChat.pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
      hasNext: startIndex > 0,
      hasPrev: endIndex < totalMessages
    };

    res.json(formattedChat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({
      message: 'Failed to fetch chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a message (soft delete)
router.delete('/:chatId/message/:messageId', authCheck, async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only allow sender to delete their own message
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    // Soft delete - mark as deleted instead of removing
    message.isDeleted = true;
    message.text = 'This message was deleted';
    message.mediaUrl = null;
    message.mediaType = null;

    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat statistics
router.get('/:chatId/stats', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const stats = {
      totalMessages: chat.messages.length,
      unreadMessages: chat.messages.filter(msg =>
        msg.sender.toString() !== userId.toString() && !msg.isRead
      ).length,
      myMessages: chat.messages.filter(msg =>
        msg.sender.toString() === userId.toString()
      ).length,
      mediaMessages: chat.messages.filter(msg => msg.mediaUrl).length,
      createdAt: chat.createdAt,
      lastActivity: chat.lastMessage
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({
      message: 'Failed to fetch chat statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;