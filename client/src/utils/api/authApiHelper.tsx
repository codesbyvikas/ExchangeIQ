const API_URL = import.meta.env.VITE_API_BASE_URL;

const authApiHelper = {
  logout: async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Logout failed');
    }

    return res.json();
  },
};

export default authApiHelper;
