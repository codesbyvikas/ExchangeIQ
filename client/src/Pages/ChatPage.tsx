import { useEffect, useRef, useState, useCallback } from 'react';
import EmojiPicker from 'emoji-picker-react';
import {
  FaVideo,
  FaPhone,
  FaPaperPlane,
  FaSmile,
  FaPlus,
  FaTrash,
  FaTimes,
  FaDownload,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import chatApiHelper from '../utils/api/chatApiHelper';
import { getMediaStream, createPeer, stopMediaStream } from '../utils/services/webRTC';
import type { ChatType, MessageType } from '../utils/types/chat';

// Types
interface MediaPreview {
  file: File;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
}

interface IncomingCall {
  from: string;
  signal: Peer.SignalData;
  type: 'video' | 'audio';
}

interface CallState {
  peer: Peer.Instance | null;
  stream: MediaStream | null;
  incomingCall: IncomingCall | null;
  callAccepted: boolean;
}

// Socket connection
const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
  withCredentials: true,
});

const ChatPage: React.FC = () => {
  // Chat state
  const [chatList, setChatList] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [message, setMessage] = useState<string>('');
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showMediaOptions, setShowMediaOptions] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');

  // Call state
  const [callState, setCallState] = useState<CallState>({
    peer: null,
    stream: null,
    incomingCall: null,
    callAccepted: false,
  });

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Initialize socket connection and get user ID
  useEffect(() => {
    // Get user ID from localStorage or API
    const currentUserId = localStorage.getItem('userId') || socket.id;
    setUserId(currentUserId);

    // Join user to their room
    socket.emit('join', { userId: currentUserId });

    // Listen for socket connection
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Load chat list
  useEffect(() => {
    const loadChats = async (): Promise<void> => {
      try {
        const chats = await chatApiHelper.getChats();
        setChatList(chats || []);
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    };
    loadChats();
  }, []);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Socket listeners for call and messages
  useEffect(() => {
    const handleIncomingCall = (data: { from: string; signal: Peer.SignalData; type: 'video' | 'audio'; callerName?: string }) => {
      setCallState(prev => ({
        ...prev,
        incomingCall: { from: data.from, signal: data.signal, type: data.type }
      }));
    };

    const handleCallAccepted = (signal: Peer.SignalData) => {
      if (callState.peer) {
        callState.peer.signal(signal);
      }
    };

    const handleCallEnded = () => {
      endCall();
    };

    const handleNewMessage = (newMessage: MessageType) => {
      // Update selected chat if it's the same chat
      if (selectedChat && selectedChat.id === newMessage.chatId) {
        setSelectedChat(prev => 
          prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
        );
      }

      // Update chat list
      setChatList(prev =>
        prev.map(chat =>
          chat.id === newMessage.chatId
            ? { ...chat, messages: [...(chat.messages || []), newMessage] }
            : chat
        )
      );
    };

    socket.on('callIncoming', handleIncomingCall);
    socket.on('callAccepted', handleCallAccepted);
    socket.on('callEnded', handleCallEnded);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('callIncoming', handleIncomingCall);
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callEnded', handleCallEnded);
      socket.off('newMessage', handleNewMessage);
    };
  }, [callState.peer, selectedChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const handleSelectChat = async (chat: ChatType): Promise<void> => {
    setSelectedChat(null);
    try {
      const updatedChat = await chatApiHelper.getChatById(chat.id);
      setSelectedChat(updatedChat);
      resetInputState();
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const resetInputState = (): void => {
    setShowEmojiPicker(false);
    setShowMediaOptions(false);
    setMessage('');
    setMediaPreview(null);
  };

  const handleSend = async (): Promise<void> => {
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
          text: message.trim() 
        });
      }

      // Update selected chat messages
      setSelectedChat(prev => 
        prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
      );

      // Update chat list
      setChatList(prev =>
        prev.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...(chat.messages || []), newMessage] }
            : chat
        )
      );

      // Emit message to socket for real-time delivery
      socket.emit('sendMessage', {
        chatId: selectedChat.id,
        message: newMessage,
        recipientId: selectedChat.id // or however you identify the recipient
      });

      resetInputState();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: MediaPreview['type']
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview({ file, url, type });
      setShowMediaOptions(false);
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }): void => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && canSend) {
      handleSend();
    }
  };

  // Call functions
  const callUser = useCallback(async (isVideoCall: boolean = true): Promise<void> => {
    if (!selectedChat) return;

    try {
      const constraints = isVideoCall 
        ? { video: true, audio: true }
        : { video: false, audio: true };
      
      const localStream = await getMediaStream(constraints);
      
      setCallState(prev => ({ ...prev, stream: localStream }));
      
      if (myVideoRef.current && isVideoCall) {
        myVideoRef.current.srcObject = localStream;
      }

      const peer = createPeer(
        true,
        localStream,
        (signalData: Peer.SignalData) => {
          socket.emit('callUser', {
            userToCall: selectedChat.id,
            from: userId,
            signalData,
            type: isVideoCall ? 'video' : 'audio',
          });
        },
        (remoteStream: MediaStream) => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = remoteStream;
          }
        },
        (error: Error) => {
          console.error('Peer error:', error);
          endCall();
        }
      );

      setCallState(prev => ({
        ...prev,
        peer,
        callAccepted: true
      }));
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to start call. Please check your camera and microphone permissions.');
    }
  }, [selectedChat, userId]);

  const answerCall = useCallback(async (): Promise<void> => {
    if (!callState.incomingCall) return;

    try {
      const isVideoCall = callState.incomingCall.type === 'video';
      const constraints = isVideoCall 
        ? { video: true, audio: true }
        : { video: false, audio: true };
      
      const localStream = await getMediaStream(constraints);
      
      setCallState(prev => ({ ...prev, stream: localStream }));
      
      if (myVideoRef.current && isVideoCall) {
        myVideoRef.current.srcObject = localStream;
      }

      const peer = createPeer(
        false,
        localStream,
        (signalData: Peer.SignalData) => {
          socket.emit('answerCall', { 
            to: callState.incomingCall!.from, 
            signal: signalData 
          });
        },
        (remoteStream: MediaStream) => {
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = remoteStream;
          }
        },
        (error: Error) => {
          console.error('Peer error:', error);
          endCall();
        }
      );

      peer.signal(callState.incomingCall.signal);

      setCallState(prev => ({
        ...prev,
        peer,
        callAccepted: true,
        incomingCall: null
      }));
    } catch (error) {
      console.error('Failed to answer call:', error);
      alert('Failed to answer call. Please check your camera and microphone permissions.');
    }
  }, [callState.incomingCall]);

  const endCall = useCallback((): void => {
    if (callState.peer) {
      callState.peer.destroy();
    }
    if (callState.stream) {
      stopMediaStream(callState.stream);
    }
    
    setCallState({
      peer: null,
      stream: null,
      incomingCall: null,
      callAccepted: false
    });

    if (selectedChat) {
      socket.emit('endCall', { to: selectedChat.id });
    }
  }, [callState.peer, callState.stream, selectedChat]);

  const rejectCall = useCallback((): void => {
    if (callState.incomingCall) {
      socket.emit('rejectCall', { to: callState.incomingCall.from });
    }
    setCallState(prev => ({ ...prev, incomingCall: null }));
  }, [callState.incomingCall]);

  // Media rendering component
  const renderMediaContent = (msg: MessageType) => {
    if (!msg.mediaUrl) return null;

    const mediaType = msg.mediaType;
    
    switch (mediaType) {
      case 'image':
        return (
          <div className="mb-2">
            <img 
              src={msg.mediaUrl} 
              alt="Shared image" 
              className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(msg.mediaUrl, '_blank')}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="mb-2">
            <video 
              src={msg.mediaUrl} 
              controls 
              className="max-w-full h-auto rounded-lg"
              preload="metadata"
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="mb-2">
            <audio 
              src={msg.mediaUrl} 
              controls 
              className="w-full"
              preload="metadata"
            />
          </div>
        );
      
      case 'document':
        return (
          <div className="mb-2 p-3 bg-gray-100 rounded-lg flex items-center gap-2">
            <FaDownload className="text-gray-600" />
            <a 
              href={msg.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Download Document
            </a>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Computed values
  const filteredChats = chatList.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canSend = Boolean(selectedChat && !isUploading && (message.trim() || mediaPreview));

  return (
    <div 
      className="flex h-dvh w-screen font-sans overflow-hidden" 
      style={{ background: 'linear-gradient(to bottom, #E0F2FF, #FDECEA)' }}
    >
      {/* Sidebar */}
      <div className="w-72 bg-[#3178C6] text-white flex flex-col p-4 overflow-y-auto">
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
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`cursor-pointer p-3 rounded-lg transition-colors ${
                selectedChat?.id === chat.id 
                  ? 'bg-[#245fa0]' 
                  : 'hover:bg-[#276db9]'
              }`}
            >
              <div className="font-semibold">{chat.name}</div>
              <div className="text-sm text-blue-200">{chat.skill}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1 rounded-tl-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="text-left">
            <div className="text-lg font-semibold">
              {selectedChat?.name || 'Select a user'}
            </div>
            <div className="text-sm text-gray-500">{selectedChat?.skill}</div>
          </div>
          
          {selectedChat && (
            <div className="flex gap-4 text-[#3178C6] items-center">
              <button
                onClick={() => callUser(false)}
                className="hover:text-blue-700 transition-colors"
                title="Voice call"
              >
                <FaPhone size={20} />
              </button>
              <button
                onClick={() => callUser(true)}
                className="hover:text-blue-700 transition-colors"
                title="Video call"
              >
                <FaVideo size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Video Area */}
        {callState.callAccepted && (
          <div className="flex justify-center items-center gap-4 bg-black py-4">
            <video 
              ref={myVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-40 h-32 rounded border-2 border-gray-600" 
            />
            <video 
              ref={userVideoRef} 
              autoPlay 
              playsInline 
              className="w-40 h-32 rounded border-2 border-gray-600" 
            />
            <button 
              onClick={endCall} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
            >
              End Call
            </button>
          </div>
        )}

        {/* Incoming Call */}
        {callState.incomingCall && !callState.callAccepted && (
          <div className="p-4 text-center bg-yellow-100 border-b">
            <p className="mb-3">📞 Incoming {callState.incomingCall.type} call...</p>
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
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {selectedChat?.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'you'
                  ? 'bg-[#CDE8FF] self-end ml-auto text-right'
                  : 'bg-white self-start mr-auto'
              } shadow-[0_4px_8px_rgba(0,0,0,0.1)]`}
            >
              {/* Render media content */}
              {renderMediaContent(msg)}
              
              {/* Render text content */}
              {msg.text && <div className="mb-1">{msg.text}</div>}
              
              {/* Timestamp */}
              <div className="text-xs text-gray-400">{msg.timestamp}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="px-4 py-2 bg-gray-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {mediaPreview.type}: {mediaPreview.file.name}
                </span>
                {mediaPreview.type === 'image' && (
                  <img 
                    src={mediaPreview.url} 
                    alt="Preview" 
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
              </div>
              <button
                onClick={() => setMediaPreview(null)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="relative flex items-center px-4 py-3 bg-white border-t gap-3">
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
                  <span className="text-sm">🎵 Audio</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, 'audio')}
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
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaPlus size={18} />
          </button>
          
          <button 
            onClick={() => setShowEmojiPicker(prev => !prev)} 
            className="text-yellow-500 hover:text-yellow-600 transition-colors"
          >
            <FaSmile size={18} />
          </button>
          
          <input
            type="text"
            placeholder={isUploading ? "Uploading..." : "Type a message"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 border-none outline-none px-4 py-2 rounded-full bg-gray-100 disabled:opacity-50 focus:bg-white focus:ring-2 focus:ring-blue-300"
            disabled={isUploading}
          />
          
          <button
            onClick={canSend ? handleSend : undefined}
            disabled={!canSend}
            className={`transition-colors ${
              canSend 
                ? 'text-[#3178C6] hover:text-blue-700 cursor-pointer' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;