import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/google/success", {
          credentials: "include",
        });

        const data = await res.json();

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

        // if (missingFields.includes("profession")) {
        //   return navigate("/profile/profession");
        // }

        // Default fallback
        return navigate("/");
      } catch (err) {
        console.error("Login check failed:", err);
        navigate("/auth");
      }
    };

    checkProfile();
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center text-gray-600">
      <p>Checking your profile…</p>
    </div>
  );
};

export default LoginRedirectHandler;
