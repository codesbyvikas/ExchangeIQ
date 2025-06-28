// profileApi.tsx
import axios from "axios";
import type { UserType } from "../types/user";

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
    try {
      const res = await axios.post<ProfileUpdateResponse>(
        `${API_URL}/profile/edit`,
        payload,
        {
          withCredentials: true,
        }
      );
      return res.data;
    } catch (error: any) {
      console.error("Error updating profile:", error.response?.data || error.message);
      throw error.response?.data || { error: "Something went wrong" };
    }
  },

  getProfile: async (): Promise<UserType> => {
    try {
      const res = await axios.get<UpdatedUser>(`${API_URL}/profile/me`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error: any) {
      console.error("Error fetching profile:", error.response?.data || error.message);
      throw error.response?.data || { error: "Something went wrong" };
    }
  }
};

export default  profileApiHelper 
;
