import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import EmojiPicker from 'emoji-picker-react';
import {
  FaVideo,
  FaPhone,
  FaPaperPlane,
  FaSmile,
  FaPlus,
  FaTrash,
  FaTimes,
  FaArrowLeft,
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import profileApiHelper from '../utils/api/profileApiHelper.tsx';
import { getSocket } from '../utils/services/socket';
import chatApiHelper from '../utils/api/chatApiHelper';
import VideoCallWrapper from '../Components/VideoCallWrapper';
// Add type interfaces at the top
interface MessageType {
  id?: string;
  sender: string; // This will be 'you' | 'them' | actual user ID
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  publicId?: string;
  timestamp: string;
  fullTimestamp?: string;
  isRead: boolean;
}

interface ChatType {
  id: string;
  name: string;
  photo?: string;
  skill: string;
  participants?: Array<{
    _id: string;
    name: string;
    photo?: string;
  }>;
  messages: MessageType[];
  lastMessage?: string;
  chatType?: string;
  skillInvolved?: {
    name: string;
  };
  unreadCount?: number;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UserType {
  _id: string;
  name: string;
  photo?: string;
}

interface MediaPreview {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
}

interface IncomingCall {
  from: string;
  type: 'video' | 'audio';
  channelName: string;
  callerInfo: {
    name: string;
    avatar: string;
  };
}

interface ActiveCall {
  channelName: string;
  uid: number;
}

const socket = getSocket();

const ChatPage: React.FC = () => {
  // State management
  const [chatList, setChatList] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [message, setMessage] = useState<string>('');
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showMediaOptions, setShowMediaOptions] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [showChatList, setShowChatList] = useState<boolean>(true);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const params = useParams();

  // Memoized values
  const filteredChats = useMemo(() => 
    chatList.filter(chat =>
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [chatList, searchTerm]);

  const canSend = useMemo(() => 
    Boolean(selectedChat && !isUploading && (message.trim() || mediaPreview)), 
    [selectedChat, isUploading, message, mediaPreview]);

  // ✅ FIXED: Define resetInputState before it's used
  const resetInputState = useCallback(() => {
    setShowEmojiPicker(false);
    setShowMediaOptions(false);
    setMessage('');
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview.url);
      setMediaPreview(null);
    }
  }, [mediaPreview]);

  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview.url);
      }
      socket.disconnect();
    };
  }, [mediaPreview]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileRes = await profileApiHelper.getSelfProfile();
        setCurrentUser(profileRes);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle URL params for active calls
  useEffect(() => {
    if (params.channelName && params.uid) {
      setActiveCall({
        channelName: params.channelName,
        uid: parseInt(params.uid, 10)
      });
    } else {
      setActiveCall(null);
    }
  }, [params]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowChatList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ FIXED: Load chats and join all chat rooms
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const chats = await chatApiHelper.getChats();
        setChatList(chats || []);
        
        // Join all chat rooms when chats are loaded
        if (socket && chats && chats.length > 0) {
          chats.forEach(chat => {
            socket.emit('joinChat', chat.id);
            console.log(`🏠 Joined chat room: ${chat.id}`);
          });
        }
      } catch (error) {
        console.error('Failed to load chats:', error);
        setError("Failed to load chats. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Socket setup
  useEffect(() => { 
    if (currentUser && socket) {
      socket.emit('setup', currentUser._id);
    }
  }, [currentUser]);

  // ✅ FIXED: Socket event handlers for real-time messages
  useEffect(() => {
    // Define interface for socket message data (backend format)
    interface SocketMessageData {
      chatId: string;
      message: Omit<MessageType, 'sender'> & {
        sender: string; // This will be the actual user ID from backend
      };
    }

    const handleNewMessage = (data: SocketMessageData) => {
      console.log('📨 Received new message:', data);
      
      // Convert sender ID to 'you'/'them' based on current user
      const processedMessage: MessageType = {
        ...data.message,
        sender: data.message.sender === currentUser?._id ? 'you' : 'them'
      };
      
      // Update the selected chat if it matches
      if (selectedChat && selectedChat.id === data.chatId) {
        setSelectedChat(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, processedMessage]
          };
        });
      }
      
      setChatList(prev => prev.map(chat => 
        chat.id === data.chatId 
          ? { ...chat, messages: [...(chat.messages || []), processedMessage] }
          : chat
      ));
    };

    const handleIncomingCall = (data: IncomingCall) => {
      setIncomingCall(data);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
      if (activeCall) {
        navigate('/chat');
      }
    };

    // ✅ FIXED: Add connection handlers
    const handleConnect = () => {
      console.log('✅ Socket connected');
      setError(null);
      // Rejoin all chat rooms on reconnection
      chatList.forEach(chat => {
        socket.emit('joinChat', chat.id);
      });
    };

    const handleDisconnect = () => {
      console.log('❌ Socket disconnected');
      setError('Connection lost. Trying to reconnect...');
    };

    if (socket && currentUser) {
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('newMessage', handleNewMessage);
      socket.on('callIncoming', handleIncomingCall);
      socket.on('callEnded', handleCallEnded);
    }

    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('newMessage', handleNewMessage);
        socket.off('callIncoming', handleIncomingCall);
        socket.off('callEnded', handleCallEnded);
      }
    };
  }, [selectedChat, activeCall, navigate, currentUser, chatList]);

  const handleSelectChat = useCallback(async (chat: ChatType) => {
    setSelectedChat(null);
    setError(null);
    
    try {
      const updatedChat = await chatApiHelper.getChatById(chat.id);

      // The API should return messages in the correct format already
      setSelectedChat(updatedChat);

      resetInputState();

      if (isMobile) {
        setShowChatList(false);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
      setError("Failed to load chat messages.");
    }
  }, [currentUser, isMobile, resetInputState]);

  const handleBackToChats = useCallback(() => {
    setSelectedChat(null);
    setShowChatList(true);
    resetInputState();
    setError(null);
  }, [resetInputState]);

  // ✅ FIXED: handleSend with proper resetInputState usage
  const handleSend = useCallback(async () => {
    if (!selectedChat || (!message.trim() && !mediaPreview) || isUploading) return;

    setIsUploading(true);
    setError(null);

    try {
      let newMessage: MessageType;

      if (mediaPreview) {
        const upload = await chatApiHelper.uploadMedia(mediaPreview.file);
        newMessage = await chatApiHelper.sendMessage(selectedChat.id, {
          text: message || undefined,
          mediaUrl: upload.url,
          mediaType: upload.mediaType,
          publicId: upload.publicId,
        });
      } else {
        newMessage = await chatApiHelper.sendMessage(selectedChat.id, {
          text: message.trim(),
        });
      }

      // Don't add to local state immediately - let socket handle it
      // This prevents duplicate messages and ensures consistency
      
      resetInputState();
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [selectedChat, message, mediaPreview, isUploading, resetInputState]);

  const callUser = useCallback((isVideoCall: boolean = true) => {
    if (!selectedChat || !currentUser) return;

    const otherParticipant = selectedChat.participants?.find(
      (p) => p._id !== currentUser._id
    );
    console.log("other", otherParticipant);
    if (!otherParticipant) return;

    const channelName = `call_${Date.now()}`;
    const uid = Math.floor(Math.random() * 1000000);

    socket.emit('callUser', {
      userToCall: otherParticipant._id,
      from: socket.id,
      type: isVideoCall ? 'video' : 'audio',
      channelName,
      callerInfo: {
        name: currentUser.name,
        avatar: currentUser.photo,
      },
    });

    navigate(`/video-call/${channelName}/${uid}`);
  }, [selectedChat, currentUser, navigate]);

  const answerCall = useCallback(() => {
    if (!incomingCall) return;
    
    const uid = Math.floor(Math.random() * 1000000);
    navigate(`/video-call/${incomingCall.channelName}/${uid}`);
    setIncomingCall(null);
  }, [incomingCall, navigate]);

  const endCall = useCallback(() => {
    if (!activeCall || !selectedChat || !currentUser) return;

    const otherParticipant = selectedChat.participants?.find(
      (p) => p._id !== currentUser._id
    );
    console.log("other", otherParticipant);
    if (otherParticipant) {
      socket.emit('endCall', { to: otherParticipant._id });
    }
    navigate('/chat');
  }, [activeCall, selectedChat, currentUser, navigate]);

  const rejectCall = useCallback(() => {
    if (!incomingCall) return;
    setIncomingCall(null);
    socket.emit('rejectCall', { to: incomingCall.from });
  }, [incomingCall]);

  const handleEmojiClick = useCallback((emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: MediaPreview['type']) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous preview
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview.url);
      }
      
      const url = URL.createObjectURL(file);
      setMediaPreview({ file, url, type });
      setShowMediaOptions(false);
    }
  }, [mediaPreview]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSend) {
      handleSend();
    }
  }, [canSend, handleSend]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-gradient-to-b from-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If we're in an active call, show the VideoCallWrapper
  if (activeCall) {
    return (
      <VideoCallWrapper 
        channelName={activeCall.channelName} 
        uid={activeCall.uid} 
        onEnd={endCall}
      />
    );
  }

  return (
    <div
      className="flex h-dvh w-screen font-sans overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #E0F2FF, #FDECEA)' }}
    >
      {/* Error notification */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-white hover:text-gray-200">
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR - Chat List */}
      <div
        className={`${
          isMobile
            ? showChatList
              ? 'w-full'
              : 'w-0 opacity-0 pointer-events-none'
            : 'w-72'
        } bg-[#3178C6] text-white flex-shrink-0 flex flex-col p-4 overflow-y-auto transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-wide">ExchangeIQ</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
            aria-label="Close chat"
          >
            <FaTimes size={14} />
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 mb-4 rounded bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Search chats"
        />
        
        <div className="space-y-2">
          {filteredChats.length === 0 ? (
            <div className="text-center text-blue-200 py-8">
              {searchTerm ? 'No chats found' : 'No chats available'}
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`cursor-pointer p-3 rounded-lg transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-[#245fa0]' : 'hover:bg-[#276db9]'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectChat(chat);
                  }
                }}
              >
                <div className="font-semibold">{chat.name}</div>
                <div className="text-sm text-blue-200">{chat.skill}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`${
          isMobile
            ? showChatList
              ? 'w-0 opacity-0 pointer-events-none'
              : 'w-full'
            : 'flex-1'
        } flex flex-col rounded-tl-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            {/* Back button for mobile */}
            {isMobile && (
              <button
                onClick={handleBackToChats}
                className="text-[#3178C6] hover:text-blue-700 transition-colors p-1"
                aria-label="Back to chat list"
              >
                <FaArrowLeft size={18} />
              </button>
            )}
            <div className="text-left">
              <div className="text-lg font-semibold">
                {selectedChat?.name || 'Select a user'}
              </div>
              {selectedChat && <div className="text-sm text-gray-500">{selectedChat.skill}</div>}
            </div>
          </div>
          
          {selectedChat && (
            <div className="flex gap-3 text-[#3178C6] items-center">
              <button
                onClick={() => callUser(false)}
                className="hover:text-blue-700 transition-colors p-2"
                title="Voice call"
                aria-label="Start voice call"
              >
                <FaPhone size={18} />
              </button>
              <button
                onClick={() => callUser(true)}
                className="hover:text-blue-700 transition-colors p-2"
                title="Video call"
                aria-label="Start video call"
              >
                <FaVideo size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Incoming Call Notification */}
        {incomingCall && !activeCall && (
          <div className="p-4 text-center bg-yellow-100 border-b">
            <p className="mb-3">
              📞 Incoming {incomingCall.type} call from {incomingCall.callerInfo.name}
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={answerCall} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
              >
                Accept
              </button>
              <button 
                onClick={rejectCall} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3">
          {!selectedChat ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a chat to start messaging
            </div>
          ) : selectedChat.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No messages yet. Start a conversation!
            </div>
          ) : (
            selectedChat.messages.map((msg, idx) => {
              const isSenderYou = msg.sender === 'you';
              
              return (
                <div
                  key={`${msg.id || idx}`}
                  className={`max-w-xs md:max-w-md px-3 py-2 md:px-4 md:py-2 rounded-lg ${
                    isSenderYou
                      ? 'bg-[#CDE8FF] self-end ml-auto text-right'
                      : 'bg-white self-start mr-auto'
                  } shadow-[0_4px_8px_rgba(0,0,0,0.1)]`}
                >
                  {msg.text && <div className="mb-1 text-sm md:text-base">{msg.text}</div>}

                  {msg.mediaUrl && (
                    <div className="mt-2">
                      {msg.mediaType === 'image' && (
                        <img
                          src={msg.mediaUrl}
                          alt="Sent media"
                          className="max-w-full max-h-48 md:max-h-64 rounded shadow"
                          loading="lazy"
                        />
                      )}
                      {msg.mediaType === 'video' && (
                        <video
                          src={msg.mediaUrl}
                          controls
                          className="max-w-full rounded shadow"
                          preload="metadata"
                        />
                      )}
                      {msg.mediaType === 'audio' && (
                        <audio
                          controls
                          src={msg.mediaUrl}
                          className="w-full"
                          preload="metadata"
                        />
                      )}
                      {msg.mediaType === 'document' && (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm hover:text-blue-800"
                        >
                          📄 View Document
                        </a>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="px-4 py-2 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate">
                {mediaPreview.type}: {mediaPreview.file.name}
              </span>
              <button
                onClick={() => {
                  URL.revokeObjectURL(mediaPreview.url);
                  setMediaPreview(null);
                }}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label="Remove media"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        {selectedChat && (
          <div className="relative flex items-center px-3 py-2 md:px-4 md:py-3 bg-white border-t gap-2 md:gap-3">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 right-4 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            {/* Media Options */}
            {showMediaOptions && (
              <div className="absolute bottom-16 left-4 bg-white border rounded-lg shadow-lg p-2 z-50">
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <span className="text-sm">📷 Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image')}
                      className="hidden"
                    />
                  </label>
                  <label className="cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <span className="text-sm">🎥 Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                      className="hidden"
                    />
                  </label>
                  <label className="cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <span className="text-sm">📄 Document</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileChange(e, 'document')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            <button 
              onClick={() => setShowMediaOptions(prev => !prev)} 
              className="text-gray-600 hover:text-gray-800 transition-colors p-2"
              aria-label="Add media"
            >
              <FaPlus size={16} />
            </button>
            
            <button 
              onClick={() => setShowEmojiPicker(prev => !prev)} 
              className="text-yellow-500 hover:text-yellow-600 transition-colors p-2"
              aria-label="Add emoji"
            >
              <FaSmile size={16} />
            </button>
            
            <input
              type="text"
              placeholder={isUploading ? "Uploading..." : "Type a message"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 border-none outline-none px-3 py-2 md:px-4 md:py-2 rounded-full bg-gray-100 disabled:opacity-50 focus:bg-white focus:ring-2 focus:ring-blue-300 text-sm md:text-base"
              disabled={isUploading}
            />
            
            <button
              onClick={canSend ? handleSend : undefined}
              disabled={!canSend}
              className={`transition-colors p-2 ${
                canSend 
                  ? 'text-[#3178C6] hover:text-blue-700 cursor-pointer' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;