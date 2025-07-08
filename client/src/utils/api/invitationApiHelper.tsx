import axios from "axios";
import type {
  InvitationType,
  InvitationStatus,
  SendInvitationPayload,
} from "../types/invitation";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const invitationApiHelper = {
  sendInvitation: async (payload: SendInvitationPayload): Promise<InvitationType> => {
    const res = await axios.post(`${API_URL}/invitation/send`, payload, {
      withCredentials: true
    });
    return res.data;
  },

  getUserInvitations: async (): Promise<InvitationType[]> => {
    const res = await axios.get(`${API_URL}/invitation`, {
      withCredentials: true
    });
    return res.data;
  },

  updateInvitationStatus: async (
    id: string,
    status: InvitationStatus
  ): Promise<InvitationType> => {
    const res = await axios.patch(
      `${API_URL}/invitation/${id}/status`,
      { status },
      { withCredentials: true }
    );
    return res.data;
  }
};

export default invitationApiHelper;
