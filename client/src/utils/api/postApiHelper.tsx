import axios from "axios";
import type { PostType } from "../types/post";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const postApiHelper = {
  // 🔍 Get all posts
  getLearnPost: async (): Promise<PostType[]> => {
    try {
      const response = await axios.get(`${API_URL}/post/learn/show`, {
        withCredentials: true,
      });
      return response.data;
    } catch (e) {
      console.error("Error fetching posts:", e);
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
      console.error("Error fetching posts:", e);
      return [];
    }
  },

  // ✏️ Create a post
  createLearnPost: async (learnSkill: string): Promise<PostType | null> => {
    try {
      const response = await axios.post(
        `${API_URL}/post/learn/add`,
        { learnSkill },
        { withCredentials: true }
      );
      return response.data;
    } catch (e: any) {
      console.error("Error creating post:", e?.response?.data || e.message);
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
      console.error("Error creating post:", e?.response?.data || e.message);
      return null;
    }
  },

  // ❌ Delete a post
  deletePost: async (postId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/post/${postId}`, {
        withCredentials: true,
      });
      return true;
    } catch (e) {
      console.error("Error deleting post:", e);
      return false;
    }
  },
};

export default postApiHelper;
