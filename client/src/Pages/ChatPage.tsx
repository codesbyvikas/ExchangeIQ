import { useEffect, useRef, useState } from 'react';
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
import type { ChatType, MessageType } from '../utils/types/chat';
import type{ UserType } from '../utils/types/user';

interface MediaPreview {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
}

const socket = getSocket();

const ChatPage: React.FC = () => {
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
  const [incomingCall, setIncomingCall] = useState<{
    from: string;
    type: 'video' | 'audio';
    channelName: string;
    callerInfo: any;
  } | null>(null);
  const [activeCall, setActiveCall] = useState<{
    channelName: string;
    uid: number;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const params = useParams();

  // Check if we're in a call from URL params

  useEffect(() => {
      return () => {
        socket.disconnect();
      };
    }, []);
    
     useEffect(() => {
  const fetchProfile = async () => {
    try {
      const profileRes = await profileApiHelper.getSelfProfile();
      setCurrentUser(profileRes);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  fetchProfile();
}, []);

  useEffect(() => {
    if (params.channelName && params.uid) {
      setActiveCall({
        channelName: params.channelName,
        uid: parseInt(params.uid)
      });
    } else {
      setActiveCall(null);
    }
  }, [params]);

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

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await chatApiHelper.getChats();
        
        setChatList(chats || []);
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    };
    loadChats();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  useEffect(() => {
  if (currentUser && socket) {
    socket.emit('setup', currentUser._id);
  }
}, [currentUser]);

  useEffect(() => {
    const handleIncomingCall = (data: {
      from: string;
      type: 'video' | 'audio';
      channelName: string;
      callerInfo: any;
    }) => {
      setIncomingCall(data);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
      if (activeCall) {
        navigate('/chat');
      }
    };

    socket.on('callIncoming', handleIncomingCall);
    socket.on('callEnded', handleCallEnded);

    return () => {
      socket.off('callIncoming', handleIncomingCall);
      socket.off('callEnded', handleCallEnded);
    };
  }, [activeCall, navigate]);

  const handleSelectChat = async (chat: ChatType) => {
    setSelectedChat(null);
    try {
      const updatedChat = await chatApiHelper.getChatById(chat.id);
      console.log(updatedChat.participants);
      setSelectedChat(updatedChat);
      resetInputState();
      
      if (isMobile) {
        setShowChatList(false);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setShowChatList(true);
    resetInputState();
  };

  const resetInputState = () => {
    setShowEmojiPicker(false);
    setShowMediaOptions(false);
    setMessage('');
    setMediaPreview(null);
  };

  const handleSend = async () => {
    if (!selectedChat || (!message.trim() && !mediaPreview)) return;

    setIsUploading(true);
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

      setSelectedChat(prev =>
        prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
      );

      setChatList(prev =>
        prev.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...(chat.messages || []), newMessage] }
            : chat
        )
      );

      resetInputState();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message.');
    } finally {
      setIsUploading(false);
    }
  };

 const callUser = (isVideoCall: boolean = true) => {
  
      if (!selectedChat || !currentUser) return;
      console.log(currentUser._id)

      const otherParticipant = selectedChat.participants.find(
        (p) => p._id !== currentUser._id
      );
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
    };


  const answerCall = () => {
    if (!incomingCall) return;
    
    const uid = Math.floor(Math.random() * 1000000);
    navigate(`/video-call/${incomingCall.channelName}/${uid}`);
    setIncomingCall(null);
  };

  const endCall = () => {
      if (!activeCall || !selectedChat || !currentUser) return;

      const otherParticipant = selectedChat.participants.find(
        (p) => p._id !== currentUser._id
      );
      if (otherParticipant) {
        socket.emit('endCall', { to: otherParticipant._id });
      }
      navigate('/chat');
    };

  const rejectCall = () => {
    setIncomingCall(null);
    socket.emit('rejectCall', { to: incomingCall?.from });
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: MediaPreview['type']) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview({ file, url, type });
      setShowMediaOptions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && canSend) {
      handleSend();
    }
  };

  const filteredChats = chatList.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canSend = Boolean(selectedChat && !isUploading && (message.trim() || mediaPreview));

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
        />
        <div className="space-y-2">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`cursor-pointer p-3 rounded-lg transition-colors ${
                selectedChat?.id === chat.id ? 'bg-[#245fa0]' : 'hover:bg-[#276db9]'
              }`}
            >
              <div className="font-semibold">{chat.name}</div>
              <div className="text-sm text-blue-200">{chat.skill}</div>
            </div>
          ))}
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
              >
                <FaArrowLeft size={18} />
              </button>
            )}
            <div className="text-left">
              <div className="text-lg font-semibold">
                {selectedChat?.name || 'Select a user'}
              </div>
              <div className="text-sm text-gray-500">{selectedChat?.skill}</div>
            </div>
          </div>
          
          {selectedChat && (
            <div className="flex gap-3 text-[#3178C6] items-center">
              <button
                onClick={() => callUser(false)}
                className="hover:text-blue-700 transition-colors p-2"
                title="Voice call"
              >
                <FaPhone size={18} />
              </button>
              <button
                onClick={() => callUser(true)}
                className="hover:text-blue-700 transition-colors p-2"
                title="Video call"
              >
                <FaVideo size={18} />
              </button>
            </div>
          )}
        </div>

        {incomingCall && !activeCall && (
          <div className="p-4 text-center bg-yellow-100 border-b">
            <p className="mb-3">📞 Incoming {incomingCall.type} call...</p>
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
          {selectedChat?.messages.map((msg, idx) => {
        const isSenderYou =
      (typeof msg.sender === 'string' && msg.sender === 'you') 
  return (
    <div
      key={idx}
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
            />
          )}
          {msg.mediaType === 'video' && (
            <video
              src={msg.mediaUrl}
              controls
              className="max-w-full rounded shadow"
            />
          )}
          {msg.mediaType === 'audio' && (
            <audio
              controls
              src={msg.mediaUrl}
              className="w-full"
            />
          )}
          {msg.mediaType === 'document' && (
            <a
              href={msg.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm"
            >
              📄 View Document
                  </a>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
          </div>
        );
      })}
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
                onClick={() => setMediaPreview(null)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
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
          >
            <FaPlus size={16} />
          </button>
          
          <button 
            onClick={() => setShowEmojiPicker(prev => !prev)} 
            className="text-yellow-500 hover:text-yellow-600 transition-colors p-2"
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
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;