import axios from "axios";
import type { ChatType, MessageType } from "../types/chat";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const chatApiHelper = {
  // Get all chats for the current user
  getChats: async (): Promise<ChatType[]> => {
    const res = await axios.get(`${API_URL}/chat`, {
      withCredentials: true
    });
    return res.data;
  },

  // Get chat with a specific user
  getChatWithUser: async (userId: string): Promise<ChatType> => {
    const res = await axios.get(`${API_URL}/chat/with/${userId}`, {
      withCredentials: true,
    });
    return res.data;
  },

  // Get specific chat by ID
  getChatById: async (chatId: string): Promise<ChatType> => {
    const res = await axios.get(`${API_URL}/chat/${chatId}`, {
      withCredentials: true
    });
    return res.data;
  },

  // Send a message to a specific chat
  sendMessage: async (
    chatId: string,
    text: string
  ): Promise<MessageType> => {
    const res = await axios.post(
      `${API_URL}/chat/${chatId}/message`,
      { text },
      { withCredentials: true }
    );
    return res.data;
  },

  // Mark all unread messages in a chat as read
  markAsRead: async (chatId: string): Promise<{ message: string }> => {
    const res = await axios.patch(
      `${API_URL}/chat/${chatId}/read`,
      {},
      { withCredentials: true }
    );
    return res.data;
  }
};

export default chatApiHelper;
