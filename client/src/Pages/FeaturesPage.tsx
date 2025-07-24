import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const FeaturesPage = () => {
  return (
    <div className="flex flex-col min-h-dvh">
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow">
        <Navbar />
      </div>

      <div className="flex-1 mt-20 px-6 py-10 max-w-5xl mx-auto space-y-6 text-gray-800">
        <h1 className="text-4xl font-bold text-indigo-700 text-center">🌟 Features</h1>
        <ul className="list-disc list-inside text-lg space-y-3">
          <li>🔐 Google OAuth 2.0 Authentication (JWT-based)</li>
          <li>🧠 Create skill posts to <strong>teach</strong> or <strong>learn</strong></li>
          <li>🤝 Smart skill matching with an intuitive invitation system</li>
          <li>
            💬 Real-time chat with:
            <ul className="ml-6 list-disc">
              <li>Emoji picker</li>
              <li>Media sharing (images, videos, audio)</li>
              <li>Message timestamps</li>
            </ul>
          </li>
          <li>📞 Audio & Video calls powered by Agora SDK</li>
          <li>⚡ Socket.IO used for real-time messaging and signaling</li>
          <li>🌐 Fully responsive layout for desktop and mobile</li>
          <li>📦 Built on MERN stack (MongoDB, Express, React, Node.js)</li>
          <li>☁️ Cloudinary used for secure media uploads</li>
          <li>🎨 Clean and intuitive UI powered by Tailwind CSS</li>
        </ul>
      </div>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
