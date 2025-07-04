const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const authCheck = require('../middlewares/auth');

// Get all chats for a user
router.get('/', authCheck, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'name photo')
    .populate('skillInvolved', 'name')
    .populate('messages.sender', 'name')
    .sort({ lastMessage: -1 });

    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());
      
      return {
        id: chat._id,
        name: otherParticipant.name,
        photo: otherParticipant.photo,
        skill: `${chat.chatType.charAt(0).toUpperCase() + chat.chatType.slice(1)}: ${chat.skillInvolved.name}`,
        messages: chat.messages.map(msg => ({
          sender: msg.sender._id.toString() === userId.toString() ? 'you' : 'them',
          text: msg.text,
          timestamp: msg.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isRead: msg.isRead
        })),
        lastMessage: chat.lastMessage,
        chatType: chat.chatType,
        skillInvolved: chat.skillInvolved
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/:chatId/message', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    const newMessage = {
      sender: userId,
      text: text.trim(),
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    await chat.save();

    // Populate the sender info for response
    await chat.populate('messages.sender', 'name');
    
    const addedMessage = chat.messages[chat.messages.length - 1];
    
    res.status(201).json({
      sender: addedMessage.sender._id.toString() === userId.toString() ? 'you' : 'them',
      text: addedMessage.text,
      timestamp: addedMessage.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isRead: addedMessage.isRead
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: error.message });
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
    chat.messages.forEach(message => {
      if (message.sender.toString() !== userId.toString()) {
        message.isRead = true;
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get specific chat details
router.get('/:chatId', authCheck, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

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

    const otherParticipant = chat.participants.find(p => p._id.toString() !== userId.toString());
    
    const formattedChat = {
      id: chat._id,
      name: otherParticipant.name,
      photo: otherParticipant.photo,
      skill: `${chat.chatType.charAt(0).toUpperCase() + chat.chatType.slice(1)}: ${chat.skillInvolved.name}`,
      messages: chat.messages.map(msg => ({
        sender: msg.sender._id.toString() === userId.toString() ? 'you' : 'them',
        text: msg.text,
        timestamp: msg.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isRead: msg.isRead
      })),
      chatType: chat.chatType,
      skillInvolved: chat.skillInvolved
    };

    res.json(formattedChat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;