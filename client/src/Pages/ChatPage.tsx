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
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [chatList, setChatList] = useState<ChatType[]>([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{
    file: File;
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
  } | null>(null);

  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const chats = await chatApiHelper.getChats();
        setChatList(chats);
      } catch (err) {
        console.error('Error loading chats:', err);
      }
    };
    loadChats();
  }, []);

  const handleSelectChat = async (chat: ChatType) => {
    setSelectedChat(chat);
    setShowEmojiPicker(false);
    setShowMediaOptions(false);
    try {
      const updatedChat = await chatApiHelper.getChatById(chat.id);
      setSelectedChat(updatedChat);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const newMessage = await chatApiHelper.sendMessage(selectedChat.id, message);
      setSelectedChat((prev) => prev && { ...prev, messages: [...prev.messages, newMessage] });
      setMessage('');
      setMediaPreview(null);
      setShowEmojiPicker(false);
      setShowMediaOptions(false);
    } catch (err) {
      console.error('Error sending message:', err);
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
      setMessage(file.name);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

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
          {chatList
            .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`cursor-pointer p-3 rounded-lg transition ${
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
      <div className="flex flex-col flex-1 rounded-tl-xl shadow-md overflow-hidden">
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
              <div>{msg.text}</div>
              <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <div className="relative flex items-center px-4 py-3 bg-white border-t gap-3">
          {showMediaOptions && (
            <div className="absolute bottom-16 left-4 bg-white shadow-md rounded-lg p-2 space-y-2 z-50 text-sm">
              {['image', 'video', 'audio', 'document'].map((type) => (
                <label key={type} className="cursor-pointer block hover:text-[#3178C6]">
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

          <button onClick={() => setShowMediaOptions((prev) => !prev)} className="text-gray-600 text-lg">
            <FaPlus />
          </button>
          <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="text-yellow-500 text-lg">
            <FaSmile />
          </button>

          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 border-none outline-none px-4 py-2 rounded-full bg-gray-100"
          />

          <FaPaperPlane size={20} className="text-[#3178C6] cursor-pointer" onClick={handleSend} />
        </div>

        {mediaPreview && (
          <div className="px-6 py-2 bg-white flex items-center justify-between text-sm border-t">
            <div className="flex items-center gap-4 max-w-[80%]">
              {mediaPreview.type === 'image' && (
                <img src={mediaPreview.url} alt="preview" className="w-16 h-16 object-cover rounded" />
              )}
              {mediaPreview.type === 'video' && (
                <video src={mediaPreview.url} controls className="w-24 h-16" />
              )}
              {mediaPreview.type === 'audio' && (
                <audio src={mediaPreview.url} controls className="w-32" />
              )}
              {mediaPreview.type === 'document' && (
                <a href={mediaPreview.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {mediaPreview.file.name}
                </a>
              )}
            </div>
            <FaTrash className="text-red-500 cursor-pointer" onClick={() => { setMediaPreview(null); setMessage(''); }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;