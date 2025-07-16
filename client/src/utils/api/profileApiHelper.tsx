import axios from "axios";
import type { UserType } from "../types/user";
import type { ChatUserType } from "../types/chatUser";
import { getAuthHeader } from "./authHeader";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface ProfileUpdatePayload {
  name?: string;
  profession?: string;
  learnSkills?: string[];
  teachSkills?: string[];
}

interface UpdatedUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  profession: string;
  followers: string[];
  following: string[];
  skillsToTeach: string[];
  skillsToLearn: string[];
  createdAt: string;
}

interface ProfileUpdateResponse {
  message: string;
  user: UpdatedUser;
}

const profileApiHelper = {
  profileUpdate: async (payload: ProfileUpdatePayload): Promise<ProfileUpdateResponse> => {
    const res = await axios.post(`${API_URL}/profile/edit`, payload, getAuthHeader());
    return res.data;
  },

  getSelfProfile: async (): Promise<UserType> => {
    const res = await axios.get(`${API_URL}/profile/me`, getAuthHeader());
    return res.data;
  },

  getUserById: async (id: string): Promise<UserType> => {
    const res = await axios.get(`${API_URL}/profile/${id}`, getAuthHeader());
    return res.data;
  },

  followUser: async (id: string) => {
    const res = await axios.post(`${API_URL}/profile/${id}/follow`, {}, getAuthHeader());
    return res.data;
  },

  unfollowUser: async (id: string) => {
    const res = await axios.post(`${API_URL}/profile/${id}/unfollow`, {}, getAuthHeader());
    return res.data;
  },

  getChatUsers: async (): Promise<ChatUserType[]> => {
    const res = await axios.get(`${API_URL}/profile/chat-users`, getAuthHeader());
    return res.data;
  },
};

export default profileApiHelper;
