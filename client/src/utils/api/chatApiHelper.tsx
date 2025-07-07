// src/utils/api/chatApiHelper.ts
import axios from "axios";
import type { ChatType, MessageType, UploadMediaResponse } from "../types/chat";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const chatApiHelper = {
  getChats: async (): Promise<ChatType[]> => {
    const res = await axios.get(`${API_URL}/chat`, { withCredentials: true });
    return Array.isArray(res.data) ? res.data : res.data?.chats || [];
  },

  getChatById: async (chatId: string): Promise<ChatType> => {
    const res = await axios.get(`${API_URL}/chat/${chatId}`, { withCredentials: true });
    return res.data;
  },

  sendMessage: async (
    chatId: string,
    content: {
      text?: string;
      mediaUrl?: string;
      mediaType?: string;
      publicId?: string;
    }
  ): Promise<MessageType> => {
    const res = await axios.post(`${API_URL}/chat/${chatId}/message`, content, {
      withCredentials: true,
    });
    return res.data;
  },

  uploadMedia: async (file: File, chatId?: string): Promise<UploadMediaResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (chatId) formData.append("chatId", chatId);

    const res = await axios.post(`${API_URL}/media/upload`, formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
};

export default chatApiHelper;
