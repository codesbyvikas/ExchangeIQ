import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";

const DocumentationPage = () => {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Sticky Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 mt-20 px-6 py-10 max-w-6xl mx-auto text-gray-800 space-y-10">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-indigo-700">🔁 ExchangeIQ</h1>
        <p className="text-lg text-center">
          <strong>ExchangeIQ</strong> is a modern skill exchange platform that empowers individuals to{" "}
          <strong>teach what they know</strong> and <strong>learn what they love</strong>. Whether it’s coding,
          photography, music, or any life skill — ExchangeIQ connects you to people who complement your learning goals.
        </p>

        {/* Banner */}
        <div className="flex justify-center">
          <img
            src="https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/logopng2.png?raw=true"
            alt="ExchangeIQ Banner"
            className="rounded-xl shadow-md max-w-full"
          />
        </div>

        {/* Features */}
        <section>
          <h2 className="text-2xl font-semibold mt-10 mb-4">🌟 Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>🔐 Google OAuth 2.0 Authentication (JWT-based)</li>
            <li>🧠 Create skill posts to <strong>teach</strong> or <strong>learn</strong></li>
            <li>🤝 Smart matching with <strong>invitation system</strong></li>
            <li>
              💬 Real-time chat with:
              <ul className="ml-6 list-disc">
                <li>Emoji picker</li>
                <li>Media sharing</li>
                <li>Message timestamps</li>
              </ul>
            </li>
            <li>📞 Audio & video calls using <strong>Agora SDK</strong> (with Socket.IO signaling)</li>
            <li>🌐 Responsive UI — works great on mobile & desktop</li>
            <li>📦 Built with the <strong>MERN stack</strong></li>
          </ul>
        </section>

        {/* Demo */}
        <section>
          <h2 className="text-2xl font-semibold mt-10 mb-2">🚀 Live Demo</h2>
          <a
            href="https://exchange-iq.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            👉 Visit ExchangeIQ
          </a>
        </section>

        {/* Tech Stack */}
        <section>
          <h2 className="text-2xl font-semibold mt-10 mb-4">🧰 Tech Stack</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Frontend</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>React + TypeScript</li>
                <li>Tailwind CSS</li>
                <li>React Router</li>
                <li>Lucide Icons</li>
                <li>Socket.IO Client</li>
                <li>Agora SDK (Video/Audio Calls)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Backend</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Node.js + Express</li>
                <li>MongoDB + Mongoose</li>
                <li>JWT Authentication</li>
                <li>Socket.IO Server</li>
                <li>Cloudinary (media uploads)</li>
                <li>Multer (file handling)</li>
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-lg mb-2">Dev & Tools</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>VS Code</li>
              <li>Vite</li>
              <li>Postman / Thunder Client</li>
              <li>ESLint + Prettier</li>
              <li>Git + GitHub CI/CD</li>
            </ul>
          </div>
        </section>

        {/* Screenshots */}
        <section>
          <h2 className="text-2xl font-semibold mt-10 mb-4">📸 Screenshots</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="font-medium text-center">Home</p>
              <img
                src="https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/homepage.png?raw=true"
                alt="Home"
                className="rounded-md shadow"
              />
            </div>
            <div>
              <p className="font-medium text-center">Skill Matching</p>
              <img
                src="https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/skillinvite.png?raw=true"
                alt="Matching"
                className="rounded-md shadow"
              />
            </div>
            <div>
              <p className="font-medium text-center">Chat</p>
              <img
                src="https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/chatpage.png?raw=true"
                alt="Chat"
                className="rounded-md shadow"
              />
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <h2 className="text-2xl font-semibold mt-10 mb-4">🧑‍💻 Getting Started</h2>

          <h3 className="font-semibold mb-2">Prerequisites</h3>
          <ul className="list-disc list-inside">
            <li>Node.js (v18+)</li>
            <li>MongoDB</li>
            <li>Cloudinary Account</li>
            <li>Google OAuth Credentials</li>
            <li>Agora App ID & App Certificate</li>
          </ul>

          <h3 className="font-semibold mt-6 mb-2">Backend Setup</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre">
{`cd server
npm install
npm run dev`}
          </pre>

          <h3 className="font-semibold mt-4 mb-2">Frontend Setup</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre">
{`cd client
npm install
npm run dev`}
          </pre>

          <h3 className="font-semibold mt-4 mb-2">.env — Server</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre">
{`MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

FRONTEND_BASE_URL=http://localhost:5173

AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate`}
          </pre>

          <h3 className="font-semibold mt-4 mb-2">.env — Client</h3>
          <p className="text-sm text-gray-600 mb-2">
            ⚠️ All frontend environment variables must start with <code>VITE_</code> (required by Vite).
          </p>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto whitespace-pre">
{`VITE_BASE_API=http://localhost:5000
VITE_AGORA_APP_ID=your_agora_app_id`}
          </pre>
        </section>

        {/* Call Explanation */}
        <section>
          <h2 className="text-2xl font-semibold mt-10 mb-4">📞 How Video/Audio Calls Work</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>When a user initiates a call, the frontend requests a secure <strong>Agora token</strong> from the backend.</li>
            <li>The frontend joins the Agora channel using that token via the <code>agora-rtc-sdk-ng</code> library.</li>
            <li><strong>Socket.IO</strong> is used for real-time signaling and user presence.</li>
            <li>Users can:
              <ul className="ml-6 list-disc">
                <li>Toggle audio/video</li>
                <li>Enter full-screen mode</li>
                <li>Leave the call anytime</li>
              </ul>
            </li>
            <li>The entire call UI runs inside a <strong>modal overlay</strong> — no route change needed.</li>
          </ol>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DocumentationPage;
