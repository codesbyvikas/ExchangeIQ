import axios from "axios";
import type { Skill } from "../types/skill";
import { getAuthHeader } from "./authHeader";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const skillApiHelper = {
  getAllSkills: async (): Promise<Skill[]> => {
    const res = await axios.get(`${API_URL}/skill/all`, getAuthHeader());
    return res.data;
  },

  addSkills: async (newSkills: Skill[]): Promise<{ message: string }> => {
    const res = await axios.post(`${API_URL}/add`, newSkills, getAuthHeader());
    return res.data;
  },
};

export default skillApiHelper;
