import axios from "axios";
import type { PostType } from "../types/post";
import type { ChatUserType } from "../types/message";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const postApiHelper = {
  // Get Posts
  getLearnPost: async (): Promise<PostType[]> => {
    try {
      const response = await axios.get(`${API_URL}/post/learn/show`, {
        withCredentials: true,
      });
      return response.data;
    } catch (e) {
      console.error("Error fetching learn posts:", e);
      return [];
    }
  },

  getTeachPost: async (): Promise<PostType[]> => {
    try {
      const response = await axios.get(`${API_URL}/post/teach/show`, {
        withCredentials: true,
      });
      return response.data;
    } catch (e) {
      console.error("Error fetching teach posts:", e);
      return [];
    }
  },

  // Create Posts
  createLearnPost: async (learnSkill: string): Promise<PostType | null> => {
    try {
      const response = await axios.post(
        `${API_URL}/post/learn/add`,
        { learnSkill },
        { withCredentials: true }
      );
      return response.data;
    } catch (e: any) {
      console.error("Error creating learn post:", e?.response?.data || e.message);
      return null;
    }
  },

  createTeachPost: async (learnSkill: string): Promise<PostType | null> => {
    try {
      const response = await axios.post(
        `${API_URL}/post/teach/add`,
        { learnSkill },
        { withCredentials: true }
      );
      return response.data;
    } catch (e: any) {
      console.error("Error creating teach post:", e?.response?.data || e.message);
      return null;
    }
  },

  // Delete Learn Post
  deleteLearnPost: async (postId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/post/learn/${postId}`, {
        withCredentials: true,
      });
      return true;
    } catch (e) {
      console.error("Error deleting learn post:", e);
      return false;
    }
  },

  // Delete Teach Post
  deleteTeachPost: async (postId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/post/teach/${postId}`, {
        withCredentials: true,
      });
      return true;
    } catch (e) {
      console.error("Error deleting teach post:", e);
      return false;
    }
  },

  
};

export default postApiHelper;
