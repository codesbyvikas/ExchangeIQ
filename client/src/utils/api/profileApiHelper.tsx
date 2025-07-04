import axios from "axios";
import type { UserType } from "../types/user";
import type { ChatUserType } from "../types/chatUser";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// For profile updates
interface ProfileUpdatePayload {
  name?: string;
  profession?: string;
  learnSkills?: string[];
  teachSkills?: string[];
}

// Shape of updated user after edit
interface UpdatedUser {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  profession: string;
  skillsToTeach: string[];
  skillsToLearn: string[];
  createdAt: string;
}

interface ProfileUpdateResponse {
  message: string;
  user: UpdatedUser;
}

const profileApiHelper = {
  // Update profile (name, profession, skills)
  profileUpdate: async (payload: ProfileUpdatePayload): Promise<ProfileUpdateResponse> => {
    try {
      const res = await axios.post<ProfileUpdateResponse>(
        `${API_URL}/profile/edit`,
        payload,
        { withCredentials: true }
      );
      return res.data;
    } catch (error: any) {
      console.error("Error updating profile:", error.response?.data || error.message);
      throw error.response?.data || { error: "Something went wrong" };
    }
  },

  // Get logged-in user's own profile
  getSelfProfile: async (): Promise<UserType> => {
    try {
      const res = await axios.get<UpdatedUser>(`${API_URL}/profile/me`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error: any) {
      console.error("Error fetching profile:", error.response?.data || error.message);
      throw error.response?.data || { error: "Something went wrong" };
    }
  },

  // Get any user's profile by ID
  getUserById: async (id: string): Promise<UserType> => {
    try {
      const res = await axios.get(`${API_URL}/profile/${id}`, {
        withCredentials: true,
      });
      return res.data as UserType;
    } catch (err) {
      console.error(`Error fetching user with ID ${id}:`, err);
      throw err;
    }
  },

  // Get chat-eligible users (based on accepted invitations)
  getChatUsers: async (): Promise<ChatUserType[]> => {
    try {
      const res = await axios.get(`${API_URL}/profile/chat-users`, {
        withCredentials: true,
      });
      return res.data;
    } catch (e) {
      console.error("Error fetching chat users:", e);
      return [];
    }
  },
};

export default profileApiHelper;
