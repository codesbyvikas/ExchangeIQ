import axios from "axios";
import type { PostType } from "../types/post";
import { getAuthHeader } from "./authHeader";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const postApiHelper = {
  getLearnPost: async (): Promise<PostType[]> => {
    const res = await axios.get(`${API_URL}/post/learn/show`, getAuthHeader());
    return res.data;
  },

  getTeachPost: async (): Promise<PostType[]> => {
    const res = await axios.get(`${API_URL}/post/teach/show`, getAuthHeader());
    return res.data;
  },

  createLearnPost: async (learnSkill: string): Promise<PostType | null> => {
    try {
      const res = await axios.post(`${API_URL}/post/learn/add`, { learnSkill }, getAuthHeader());
      return res.data;
    } catch (e: any) {
      console.error("Error creating learn post:", e?.response?.data || e.message);
      return null;
    }
  },

  createTeachPost: async (learnSkill: string): Promise<PostType | null> => {
    try {
      const res = await axios.post(`${API_URL}/post/teach/add`, { learnSkill }, getAuthHeader());
      return res.data;
    } catch (e: any) {
      console.error("Error creating teach post:", e?.response?.data || e.message);
      return null;
    }
  },

  deleteLearnPost: async (postId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/post/learn/${postId}`, getAuthHeader());
      return true;
    } catch (e) {
      console.error("Error deleting learn post:", e);
      return false;
    }
  },

  deleteTeachPost: async (postId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/post/teach/${postId}`, getAuthHeader());
      return true;
    } catch (e) {
      console.error("Error deleting teach post:", e);
      return false;
    }
  },
};

export default postApiHelper;
