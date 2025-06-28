// utils/api/skillApiHelper.ts
import axios from "axios";
import type { Skill } from "../types/skill";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const skillApiHelper = {
  getAllSkills: async (): Promise<Skill[]> => {
    try {
      const response = await axios.get(`${API_URL}/skill/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching skills:", error);
      return [];
    }
  },

  addSkills: async (newSkills: Skill[]): Promise<{ message: string }> => {
    try {
      const response = await axios.post(`${API_URL}/add`, newSkills);
      return response.data;
    } catch (error) {
      console.error("Error adding skills:", error);
      throw error;
    }
  },
};

export default skillApiHelper;
