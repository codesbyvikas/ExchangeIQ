import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RotateLoader } from "react-spinners";

const LoginRedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
  const checkProfile = async () => {
    try {
      const token = searchParams.get("token");
      const profileComplete = searchParams.get("profileComplete") === "true";
      const missingFields = searchParams.get("missingFields")?.split(",") || [];

      if (!token) {
        console.error("Missing token in URL");
        return navigate("/auth");
      }

      localStorage.setItem("token", token);

      if (profileComplete) return navigate("/");
      if (missingFields.includes("skillsToLearn")) return navigate("/profile/skills/learn");
      if (missingFields.includes("skillsToTeach")) return navigate("/profile/skills/teach");

      navigate("/");
    } catch (err) {
      console.error("Login check failed:", err);
      navigate("/auth");
    }
  };

  // Just call the async function; don't return it
  checkProfile();
}, [navigate, searchParams]);


  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e0f2ff] to-[#f8fafc]">
      <RotateLoader color="#3178C6" size={18} />
    </div>
  );
};

export default LoginRedirectHandler;
