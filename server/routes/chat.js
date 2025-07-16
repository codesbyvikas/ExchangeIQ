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

// Helper function to get user ID from JWT token
const getUserId = (req) => {
  // JWT token contains user data, try both _id and id
  return req.user._id || req.user.id;
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
      publicId: msg.publicId || null, // Added publicId to response
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

// Send a message - Updated for JWT
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

    // Validate input
    const validationErrors = validateMessage(text, mediaUrl, mediaType);
    if (validationErrors.length > 0) {
      console.log('❌ Validation errors:', validationErrors);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Validate that either text or media is provided
    const hasText = text && text.trim().length > 0;
    const hasMedia = mediaUrl && mediaUrl.trim().length > 0;
    
    if (!hasText && !hasMedia) {
      console.log('❌ Neither text nor media provided');
      return res.status(400).json({
        message: 'Either text or media must be provided'
      });
    }

    // Find and validate chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      console.log('❌ Chat not found:', chatId);
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant (handle both ObjectId and string comparison)
    const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
      console.log('❌ User not in chat participants');
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    // Create new message with explicit field handling
    const newMessage = {
      sender: userId,
      text: hasText ? text.trim() : '',
      mediaUrl: hasMedia ? mediaUrl.trim() : null,
      mediaType: (hasMedia && mediaType) ? mediaType.trim() : null,
      publicId: (hasMedia && publicId) ? publicId.trim() : null,
      timestamp: new Date(),
      isRead: false
    };

    console.log('📝 Creating message object:', {
      sender: newMessage.sender,
      hasText: !!newMessage.text,
      hasMedia: !!newMessage.mediaUrl,
      mediaType: newMessage.mediaType
    });

    // Add message to chat
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    
    console.log('💾 Saving chat to database...');
    await chat.save();
    console.log('✅ Chat saved successfully');
    
    // Re-fetch the chat to get the populated message
    const updatedChat = await Chat.findById(chatId)
      .populate('messages.sender', 'name');
    
    const addedMessage = updatedChat.messages[updatedChat.messages.length - 1];

    console.log('📨 Message saved to database:', {
      id: addedMessage._id,
      text: addedMessage.text,
      mediaUrl: addedMessage.mediaUrl,
      mediaType: addedMessage.mediaType,
      publicId: addedMessage.publicId,
      sender: addedMessage.sender.name,
      timestamp: addedMessage.timestamp
    });

    // Format response message
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

    console.log('📤 Sending response message');
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

// Mark messages as read
router.patch('/:chatId/read', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = getUserId(req);

    console.log('👁️ Marking messages as read:', { chatId, userId });

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
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
      console.log(`✅ Marked ${markedCount} messages as read`);
    }

    res.json({
      message: 'Messages marked as read',
      markedCount
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
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

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p._id.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Paginate messages (newest first)
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - (page * limit));
    const endIndex = Math.max(0, totalMessages - ((page - 1) * limit));
    const paginatedMessages = chat.messages.slice(startIndex, endIndex);

    console.log(`📄 Paginated ${paginatedMessages.length} messages from ${totalMessages} total`);

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
    console.error('❌ Error fetching chat:', error);
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
    const userId = getUserId(req);

    console.log('🗑️ Deleting message:', { chatId, messageId, userId });

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
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
    message.publicId = null;

    await chat.save();

    console.log('✅ Message deleted successfully');
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting message:', error);
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
    const userId = getUserId(req);

    console.log('📊 Fetching chat stats:', { chatId, userId });

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
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

    console.log('📊 Chat stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching chat stats:', error);
    res.status(500).json({
      message: 'Failed to fetch chat statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Additional route: Get unread message count across all chats
router.get('/unread/count', authCheck, async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log('📬 Getting unread count for user:', userId);

    const chats = await Chat.find({
      participants: userId
    });

    let totalUnread = 0;
    const chatUnreadCounts = {};

    chats.forEach(chat => {
      const unreadCount = chat.messages.filter(msg =>
        msg.sender.toString() !== userId.toString() && !msg.isRead
      ).length;
      
      totalUnread += unreadCount;
      chatUnreadCounts[chat._id] = unreadCount;
    });

    console.log(`📬 Total unread messages: ${totalUnread}`);

    res.json({
      totalUnread,
      chatUnreadCounts
    });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    res.status(500).json({
      message: 'Failed to fetch unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Additional route: Search messages within a chat
router.get('/:chatId/search', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { q: query, limit = 20 } = req.query;
    const userId = getUserId(req);

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    console.log('🔍 Searching messages:', { chatId, query, userId });

    const chat = await Chat.findById(chatId)
      .populate('messages.sender', 'name');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Search messages
    const searchResults = chat.messages
      .filter(msg => 
        msg.text && 
        msg.text.toLowerCase().includes(query.toLowerCase()) && 
        !msg.isDeleted
      )
      .slice(0, parseInt(limit))
      .map(msg => ({
        id: msg._id,
        sender: msg.sender._id.toString() === userId.toString() ? 'you' : 'them',
        senderName: msg.sender.name,
        text: msg.text,
        timestamp: msg.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        fullTimestamp: msg.timestamp.toISOString(),
        // Highlight the search term (simple implementation)
        highlightedText: msg.text.replace(
          new RegExp(`(${query})`, 'gi'),
          '<mark>$1</mark>'
        )
      }));

    console.log(`🔍 Found ${searchResults.length} matching messages`);

    res.json({
      query,
      results: searchResults,
      count: searchResults.length
    });
  } catch (error) {
    console.error('❌ Error searching messages:', error);
    res.status(500).json({
      message: 'Failed to search messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;