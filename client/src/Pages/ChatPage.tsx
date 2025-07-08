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
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import chatApiHelper from '../utils/api/chatApiHelper';
import type { ChatType, MessageType } from '../utils/types/chat';

const ChatPage = () => {
  const [chatList, setChatList] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [message, setMessage] = useState('');
  const [mediaPreview, setMediaPreview] = useState<{
    file: File;
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);

  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      const chats = await chatApiHelper.getChats();
      setChatList(chats || []);
    };
    loadChats();
  }, []);

  const handleSelectChat = async (chat: ChatType) => {
    setSelectedChat(null); // reset
    const updatedChat = await chatApiHelper.getChatById(chat.id);
    setSelectedChat(updatedChat);
    setShowEmojiPicker(false);
    setShowMediaOptions(false);
    setMessage('');
    setMediaPreview(null);
  };

  const handleSend = async () => {
    if (!selectedChat) return;
    if (!message.trim() && !mediaPreview) return;

    // Don't return early if uploading - let it proceed
    setIsUploading(true);
    try {
      let newMessage: MessageType;

      if (mediaPreview) {
        console.log('Uploading media...', mediaPreview.file.name);
        const upload = await chatApiHelper.uploadMedia(mediaPreview.file);
        console.log('Upload result:', upload);
        
        newMessage = await chatApiHelper.sendMessage(selectedChat.id, {
          text: message || undefined,
          mediaUrl: upload.url,
          mediaType: upload.mediaType,
          publicId: upload.publicId,
        });
      } else {
        newMessage = await chatApiHelper.sendMessage(selectedChat.id, { text: message.trim() });
      }

      console.log('New message:', newMessage);

      // Update selected chat with new message
      setSelectedChat((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
      );
      
      // Update chat list to reflect latest message
      setChatList((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...(chat.messages || []), newMessage] }
            : chat
        )
      );

      // Clear input and preview
      setMessage('');
      setMediaPreview(null);
      setShowEmojiPicker(false);
      setShowMediaOptions(false);
    } catch (err) {
      console.error('Send failed:', err);
      // Show error to user
      alert('Failed to send message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video' | 'audio' | 'document'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaPreview({ file, url, type });
      // Don't overwrite message with filename - let user type their own message
      setShowMediaOptions(false);
    }
  };

  const filteredChats = chatList.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if send button should be enabled
  const canSend = selectedChat && !isUploading && (message.trim() || mediaPreview);

  return (
    <div className="flex h-screen w-screen font-sans overflow-hidden" style={{ background: 'linear-gradient(to bottom, #E0F2FF, #FDECEA)' }}>
      {/* Sidebar */}
      <div className="w-72 bg-[#3178C6] text-white flex flex-col p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-wide">ExchangeIQ</h1>
          <button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2">
            <FaTimes size={14} />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 mb-4 rounded bg-white text-black placeholder:text-gray-400"
        />
        <div className="space-y-4">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`cursor-pointer p-3 rounded-lg transition ${selectedChat?.id === chat.id ? 'bg-[#245fa0]' : 'hover:bg-[#276db9]'}`}
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
            <div className="text-lg font-semibold">{selectedChat?.name || 'Select a user'}</div>
            <div className="text-sm text-gray-500">{selectedChat?.skill}</div>
          </div>
          <div className="flex gap-4 text-[#3178C6] items-center">
            <FaPhone className="cursor-pointer" size={20} />
            <FaVideo className="cursor-pointer" size={20} />
          </div>
        </div>

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
              {msg.mediaUrl && (
                <div className="mb-2">
                  {msg.mediaType === 'image' && (
                    <img 
                      src={msg.mediaUrl} 
                      alt="Shared image"
                      className="rounded max-w-xs max-h-60 object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', msg.mediaUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {msg.mediaType === 'video' && (
                    <video 
                      src={msg.mediaUrl} 
                      controls 
                      className="max-w-xs rounded"
                      onError={(e) => {
                        console.error('Video failed to load:', msg.mediaUrl, e);
                      }}
                    />
                  )}
                  {msg.mediaType === 'audio' && (
                    <audio 
                      src={msg.mediaUrl} 
                      controls 
                      onError={(e) => {
                        console.error('Audio failed to load:', msg.mediaUrl, e);
                      }}
                    />
                  )}
                  {msg.mediaType === 'document' && (
                    <a 
                      href={msg.mediaUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      📄 {msg.text || 'View Document'}
                    </a>
                  )}
                </div>
              )}
              {msg.text && <div>{msg.text}</div>}
              <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="px-6 py-2 bg-white flex items-center justify-between text-sm border-t">
            <div className="flex items-center gap-4 max-w-[80%]">
              {mediaPreview.type === 'image' && (
                <img src={mediaPreview.url} alt="preview" className="w-16 h-16 object-cover rounded" />
              )}
              {mediaPreview.type === 'video' && (
                <video src={mediaPreview.url} className="w-24 h-16 object-cover rounded" />
              )}
              {mediaPreview.type === 'audio' && (
                <div className="flex items-center gap-2">
                  🎤 <span className="text-gray-600">{mediaPreview.file.name}</span>
                </div>
              )}
              {mediaPreview.type === 'document' && (
                <div className="flex items-center gap-2">
                  📄 <span className="text-blue-600">{mediaPreview.file.name}</span>
                </div>
              )}
            </div>
            <FaTrash 
              className="text-red-500 cursor-pointer hover:text-red-700" 
              onClick={() => { 
                setMediaPreview(null); 
                setMessage(''); 
              }} 
            />
          </div>
        )}

        {/* Input */}
        <div className="relative flex items-center px-4 py-3 bg-white border-t gap-3">
          {showMediaOptions && (
            <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg p-2 space-y-2 z-50 text-sm border">
              {['image', 'video', 'audio', 'document'].map((type) => (
                <label key={type} className="cursor-pointer block hover:text-[#3178C6] p-2 rounded hover:bg-gray-50">
                  {type === 'image'
                    ? '📷 Image'
                    : type === 'video'
                    ? '🎥 Video'
                    : type === 'audio'
                    ? '🎤 Audio'
                    : '📄 Document'}
                  <input
                    type="file"
                    hidden
                    accept={
                      type === 'image'
                        ? 'image/*'
                        : type === 'video'
                        ? 'video/*'
                        : type === 'audio'
                        ? 'audio/*'
                        : '.pdf,.doc,.docx,.txt'
                    }
                    onChange={(e) => handleFileChange(e, type as any)}
                  />
                </label>
              ))}
            </div>
          )}

          {showEmojiPicker && (
            <div className="absolute bottom-16 right-4 z-50">
              <EmojiPicker onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)} />
            </div>
          )}

          <button 
            onClick={() => setShowMediaOptions((prev) => !prev)} 
            className="text-gray-600 hover:text-gray-800 text-lg"
          >
            <FaPlus />
          </button>
          <button 
            onClick={() => setShowEmojiPicker((prev) => !prev)} 
            className="text-yellow-500 hover:text-yellow-600 text-lg"
          >
            <FaSmile />
          </button>

          <input
            type="text"
            placeholder={isUploading ? "Uploading..." : "Type a message"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canSend && handleSend()}
            className="flex-1 border-none outline-none px-4 py-2 rounded-full bg-gray-100 disabled:opacity-50"
            disabled={isUploading}
          />

          <FaPaperPlane
            size={20}
            className={`cursor-pointer transition-colors ${
              canSend 
                ? 'text-[#3178C6] hover:text-[#245fa0]' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            onClick={canSend ? handleSend : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;