// utils/api/agoraApiHelper.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const getAgoraToken = async (channelName: string, uid: number) => {
  try {
    console.log('Requesting token for:', { channelName, uid });

    const url = `${API_BASE}/agora/token`;
    console.log('Token request URL:', url);

    const res = await axios.get(url, {
      params: { channelName, uid },
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Token API response status:', res.status);
    console.log('Token received successfully:', { ...res.data, token: res.data.token ? '[REDACTED]' : 'missing' });

    if (!res.data?.token) {
      throw new Error('Token not found in response');
    }

    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      console.error(`Axios error (HTTP ${status}):`, data || error.message);
      throw new Error(`Token request failed: ${data?.error || error.message}`);
    } else {
      console.error('getAgoraToken failed:', error);
      throw new Error('Unexpected error occurred while requesting Agora token');
    }
  }
};

export default { getAgoraToken };
