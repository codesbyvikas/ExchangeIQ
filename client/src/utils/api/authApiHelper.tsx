// src/utils/api/authApiHelper.ts
const API_URL = import.meta.env.VITE_API_BASE_URL;

const authApiHelper = {
  logout: async () => {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'GET',
      credentials: 'include', 
    });

    if (!res.ok) {
      throw new Error('Logout failed');
    }

    return res.json(); 
  },

};

export default authApiHelper;
