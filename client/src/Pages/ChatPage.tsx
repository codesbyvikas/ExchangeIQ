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

type Message = {
  sender: 'you' | 'them';
  text: string;
  timestamp: string;
};

type ChatUser = {
  id: string;
  name: string;
  skill: string;
  messages: Message[];
};

const ChatPage = () => {
  const [selectedUserId, setSelectedUserId] = useState('1');
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaPreview, setMediaPreview] = useState<{
    file: File;
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [users, setUsers] = useState<ChatUser[]>([
    {
      id: '1',
      name: 'Divya Mourya',
      skill: 'Learning: Guitar',
      messages: [
        {
          sender: 'them',
          text: 'Hey there! I want to Learn Guitar, I can teach you Painting',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          sender: 'you',
          text: 'Sure, fine by me! what time are you comfortable.',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          sender: 'them',
          text: 'About 4 in the evening on Saturdays and Sundays?',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          sender: 'you',
          text: 'Okay fine by me',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    },
    {
      id: '2',
      name: 'Pravin Mourya',
      skill: 'Teaching: Flirting',
      messages: [
        {
          sender: 'them',
          text: 'hello sir, your tricks worked very well, thanks a lot',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        {
          sender: 'you',
          text: 'Glad ro here',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    },
    {
      id: '3',
      name: 'Samiksha Yadav',
      skill: 'Exchanging: Fitness',
      messages: [
        {
          sender: 'them',
          text: 'hi, 😁',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    },
  ]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUser?.messages.length]);

  const sendMessage = () => {
    if (!message.trim() && !mediaPreview) return;

    const newMessage: Message = {
      sender: 'you',
      text: mediaPreview
        ? `[${mediaPreview.type.toUpperCase()}] ${mediaPreview.file.name}`
        : message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUserId
          ? { ...user, messages: [...user.messages, newMessage] }
          : user
      )
    );

    setMessage('');
    setMediaPreview(null);
    setShowEmojiPicker(false);
    setShowMediaOptions(false);
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

  return (
    <div
      className="flex h-screen w-screen font-sans overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #E0F2FF, #FDECEA)' }}
    >
      {/* Sidebar */}
      <div className="w-72 bg-[#3178C6] text-white flex flex-col p-4 overflow-y-auto">
        <div className="flex flex-col mb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold tracking-wide">ExchangeIQ</h1>
            <button
              onClick={() => navigate('/')}
              title="Close Chat"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition"
            >
              <FaTimes size={14} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded bg-white text-black placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-4">
          {users
            .filter((user) =>
              user.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setSelectedUserId(user.id);
                  setShowEmojiPicker(false);
                  setShowMediaOptions(false);
                }}
                className={`cursor-pointer p-3 rounded-lg transition ${
                  selectedUserId === user.id
                    ? 'bg-[#245fa0]'
                    : 'hover:bg-[#276db9]'
                }`}
              >
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-blue-200">{user.skill}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-1 rounded-tl-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <div className="text-left">
            <div className="text-lg font-semibold">{selectedUser?.name}</div>
            <div className="text-sm text-gray-500">{selectedUser?.skill}</div>
          </div>
          <div className="flex gap-4 text-[#3178C6] items-center">
            <FaPhone className="cursor-pointer" size={20} />
            <FaVideo className="cursor-pointer" size={20} />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          {selectedUser?.messages.map((msg, idx) => (
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
          {/* Media dropdown */}
          {showMediaOptions && (
            <div className="absolute bottom-16 left-4 bg-white shadow-md rounded-lg p-2 space-y-2 z-50 text-sm">
              {['image', 'video', 'audio', 'document'].map((type) => (
                <label
                  key={type}
                  className="cursor-pointer block hover:text-[#3178C6]"
                >
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

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-4 z-50">
              <EmojiPicker
                onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)}
              />
            </div>
          )}

          {/* Input controls */}
          <button
            onClick={() => setShowMediaOptions((prev) => !prev)}
            className="text-gray-600 text-lg"
          >
            <FaPlus />
          </button>
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-yellow-500 text-lg"
          >
            <FaSmile />
          </button>

          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border-none outline-none px-4 py-2 rounded-full bg-gray-100"
          />

          <FaPaperPlane
            size={20}
            className="text-[#3178C6] cursor-pointer"
            onClick={sendMessage}
          />
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="px-6 py-2 bg-white flex items-center justify-between text-sm border-t">
            <div className="flex items-center gap-4 max-w-[80%]">
              {mediaPreview.type === 'image' && (
                <img
                  src={mediaPreview.url}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              {mediaPreview.type === 'video' && (
                <video src={mediaPreview.url} controls className="w-24 h-16" />
              )}
              {mediaPreview.type === 'audio' && (
                <audio src={mediaPreview.url} controls className="w-32" />
              )}
              {mediaPreview.type === 'document' && (
                <a
                  href={mediaPreview.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  {mediaPreview.file.name}
                </a>
              )}
            </div>
            <FaTrash
              className="text-red-500 cursor-pointer"
              onClick={() => {
                setMediaPreview(null);
                setMessage('');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
