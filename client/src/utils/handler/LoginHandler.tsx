import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RotateLoader } from "react-spinners";
import axios from "axios";

const LoginRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    const checkProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/google/success`, {
          withCredentials: true, 
        });

        const data = res.data;

        if (!data.success) {
          return navigate("/auth");
        }

        const { profileComplete, missingFields } = data;

        if (profileComplete) {
          return navigate("/");
        }

        if (missingFields.includes("skillsToLearn")) {
          return navigate("/profile/skills/learn");
        }

        if (missingFields.includes("skillsToTeach")) {
          return navigate("/profile/skills/teach");
        }

        return navigate("/");
      } catch (err) {
        console.error("Login check failed:", err);
        navigate("/auth");
      }
    };

    checkProfile();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e0f2ff] to-[#f8fafc]">
      <RotateLoader color="#3178C6" size={18} />
    </div>
  );
};

export default LoginRedirectHandler;
