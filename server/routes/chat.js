const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const authCheck = require('../middlewares/auth'); 

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

const getUserId = (req) => {
  return req.user._id || req.user.id;
};

const formatChatForUser = (chat, userId) => {
  const otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());

  return {
    id: chat._id,
    name: otherParticipant?.name || 'Unknown User',
    photo: otherParticipant?.photo || null,
    skill: chat.skillInvolved ?
      `${chat.chatType.charAt(0).toUpperCase() + chat.chatType.slice(1)}: ${chat.skillInvolved.name}` :
      'General Chat',
    participants: chat.participants, 
    messages: chat.messages.map(msg => ({
      id: msg._id,
      sender: (typeof msg.sender === 'object' && msg.sender && '_id' in msg.sender
        ? msg.sender._id.toString()
        : msg.sender.toString()) === userId.toString() ? 'you' : 'them',
      text: msg.text || '',
      mediaUrl: msg.mediaUrl || null,
      mediaType: msg.mediaType || null,
      publicId: msg.publicId || null,
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

router.get('/', authCheck, async (req, res) => {
  try {
    const userId = getUserId(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log('📱 Fetching chats for user:', userId);

    const chats = await Chat.find({
      participants: userId
    })
      .populate('participants', 'name photo')
      .populate('skillInvolved', 'name')
      .populate('messages.sender', 'name')
      .sort({ lastMessage: -1 })
      .skip(skip)
      .limit(limit);

    const totalChats = await Chat.countDocuments({
      participants: userId
    });

    const formattedChats = chats.map(chat => formatChatForUser(chat, userId));

    console.log(`✅ Found ${formattedChats.length} chats for user`);

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
    console.error('❌ Error fetching chats:', error);
    res.status(500).json({
      message: 'Failed to fetch chats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.post('/:chatId/message', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text, mediaUrl, mediaType, publicId } = req.body;
    const userId = getUserId(req);

    console.log('📤 Sending message:', {
      chatId,
      userId,
      hasText: !!(text && text.trim()),
      hasMedia: !!(mediaUrl && mediaUrl.trim()),
      mediaType
    });

    const validationErrors = validateMessage(text, mediaUrl, mediaType);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const hasText = text && text.trim().length > 0;
    const hasMedia = mediaUrl && mediaUrl.trim().length > 0;

    if (!hasText && !hasMedia) {
      console.log('❌ Neither text nor media provided');
      return res.status(400).json({
        message: 'Either text or media must be provided'
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log('Chat not found:', chatId);
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
      console.log('User not in chat participants');
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const newMessage = {
      sender: userId,
      text: hasText ? text.trim() : '',
      mediaUrl: hasMedia ? mediaUrl.trim() : null,
      mediaType: (hasMedia && mediaType) ? mediaType.trim() : null,
      publicId: (hasMedia && publicId) ? publicId.trim() : null,
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'name')
      .populate('participants', 'name photo');

    const addedMessage = updatedChat.messages[updatedChat.messages.length - 1];

    const responseMessage = {
      id: addedMessage._id,
      sender: addedMessage.sender._id.toString() === userId.toString() ? 'you' : 'them',
      text: addedMessage.text || '',
      mediaUrl: addedMessage.mediaUrl || null,
      mediaType: addedMessage.mediaType || null,
      publicId: addedMessage.publicId || null,
      timestamp: addedMessage.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullTimestamp: addedMessage.timestamp.toISOString(),
      isRead: addedMessage.isRead
    };

    
    const io = req.app.get('io');
    if (io) {
      
      io.to(`chat_${chatId}`).emit('newMessage', {
        chatId: chatId,
        message: {
          ...responseMessage,
          
          sender: addedMessage.sender._id.toString()
        }
      });
      
      console.log(`✅ Socket event sent to chat room: chat_${chatId}`);
    } else {
      console.warn('⚠️ Socket.io not available for real-time updates');
    }

    res.status(201).json(responseMessage);

  } catch (error) {
    console.error('❌ Error sending message:', error);
    console.error('❌ Error stack:', error.stack);

    res.status(500).json({
      message: 'Failed to send message',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack
      })
    });
  }
});

router.get('/:chatId', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = getUserId(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    console.log('📖 Fetching chat details:', { chatId, userId, page, limit });

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name photo')
      .populate('skillInvolved', 'name')
      .populate('messages.sender', 'name');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(p => p._id.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = Math.max(0, totalMessages - ((page - 1) * limit));
    const paginatedMessages = chat.messages.slice(startIndex, endIndex);

    const chatForFormat = {
      ...chat.toObject(),
      messages: paginatedMessages
    };

    const formattedChat = formatChatForUser(chatForFormat, userId);

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

module.exports = router;