import axios from 'axios';
import type { MessageType } from '../types/message';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const messageApiHelper = {
  async fetchMessages(user1: string, user2: string): Promise<MessageType[]> {
    const res = await axios.get(`${BASE_URL}/messages/${user1}/${user2}`, {
      withCredentials: true,
    });
    return res.data;
  },

  async sendMessage(payload: {
    to: string;
    text: string;
    media?: string;
  }): Promise<MessageType> {
    const res = await axios.post(`${BASE_URL}/messages/send`, payload, {
      withCredentials: true,
    });
    return res.data;
  },
};

export default messageApiHelper;
