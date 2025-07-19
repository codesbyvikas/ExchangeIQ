import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const DocsPage = () => {
  return (
     <div className="flex flex-col min-h-dvh">
    <div className="fixed top-0 left-0 w-full z-50 bg-white">
      <Navbar />
    </div>
    
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
        <Section title="📷 Preview">
        <img
          src="src\assets\logopng2.png"
          alt="ExchangeIQ Banner"
          className="mt-4 w-xl rounded shadow-md"
        />
      </Section>
      <h1 className="text-4xl font-bold mb-6 text-blue-600">📘 ExchangeIQ Documentation</h1>

      <p className="mb-8 text-lg">
        ExchangeIQ is a collaborative <strong>skill exchange platform</strong> where users can <strong>teach and learn</strong> from each other in real-time. It facilitates meaningful connections through skill-matching, chat, and video/audio calls.
      </p>

      <Section title="🧭 Table of Contents">
        <ul className="list-disc list-inside space-y-1">
          <li>Overview</li>
          <li>Core Features</li>
          <li>Technology Stack</li>
          <li>Getting Started</li>
          <li>Frontend Architecture</li>
          <li>Backend Architecture</li>
          <li>API Overview</li>
          <li>Authentication Flow</li>
          <li>WebSocket & WebRTC</li>
          <li>Folder Structure</li>
          <li>Contributing</li>
          <li>License</li>
        </ul>
      </Section>

      <Section title="🌟 Overview">
        <p>
          ExchangeIQ bridges the gap between people looking to learn a skill and those eager to teach. Users can exchange skills such as coding, painting, language learning, and more by sending and accepting invitations.
        </p>
        <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600 mt-4">
          Example: You want to learn <strong>guitar</strong> and can teach <strong>Python</strong>. ExchangeIQ helps you find a Python learner who can teach guitar.
        </blockquote>
      </Section>

      <Section title="🚀 Core Features">
        <ul className="list-disc list-inside space-y-1">
          <li>🔐 Google OAuth-based authentication (JWT)</li>
          <li>🎯 Skill selection (Teach & Learn)</li>
          <li>🔁 Smart skill matching system</li>
          <li>💬 Real-time chat with emoji/media support</li>
          <li>📞 Audio & video call (WebRTC via <code>simple-peer</code>)</li>
          <li>🧑‍🤝‍🧑 Invitation system to control chat access</li>
          <li>📁 Cloudinary media uploads</li>
        </ul>
      </Section>

      <Section title="🛠 Technology Stack">
        <p className="font-semibold">Frontend:</p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>React + TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Socket.IO Client</li>
          <li>Simple-Peer</li>
          <li>React Router</li>
        </ul>

        <p className="font-semibold">Backend:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Node.js + Express</li>
          <li>MongoDB + Mongoose</li>
          <li>JWT Authentication</li>
          <li>Socket.IO</li>
          <li>Cloudinary</li>
        </ul>
      </Section>

      <Section title="🧰 Getting Started">
        <p className="font-semibold mt-2">1. Clone the Repository</p>
        <CodeBlock code={`git clone https://github.com/codesbyvikas/ExchangeIQ.git\ncd ExchangeIQ`} />

        <p className="font-semibold mt-2">2. Setup Backend</p>
        <CodeBlock code={`cd server\nnpm install\n# Add .env with secrets\nnpm run dev`} />

        <p className="font-semibold mt-2">3. Setup Frontend</p>
        <CodeBlock code={`cd client\nnpm install\nnpm run dev`} />
      </Section>

      <Section title="🧩 Frontend Architecture">
        <CodeBlock code={`src/\n├── components/\n├── pages/\n├── api/\n├── store/\n├── utils/\n└── types/`} />
      </Section>

      <Section title="🧱 Backend Architecture">
        <CodeBlock code={`backend/\n├── routes/\n├── models/\n├── controllers/\n├── socket/\n└── middleware/`} />
      </Section>

      <Section title="📡 API Overview">
        <ul className="list-disc list-inside space-y-1">
          <li><code>POST /auth/google</code> – Google login</li>
          <li><code>GET /profile/me</code> – Get user profile</li>
          <li><code>POST /posts/learn</code> – Create learn post</li>
          <li><code>POST /invitations/send</code> – Send invitation</li>
          <li><code>GET /messages/:user1/:user2</code> – Fetch chat</li>
          <li><code>POST /messages/send</code> – Send message</li>
        </ul>
      </Section>

      <Section title="🔐 Authentication Flow">
        <p>
          Users authenticate via Google OAuth. The backend exchanges the Google code for user info and returns a JWT token.
        </p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>Frontend stores JWT in localStorage</li>
          <li>Sends JWT in <code>Authorization</code> headers</li>
        </ul>
      </Section>

      <Section title="🔌 WebSocket & WebRTC">
        <p>
          Real-time chat and call signaling are handled by <strong>Socket.IO</strong>. <code>simple-peer</code> is used to manage peer-to-peer WebRTC connections for audio/video calls.
        </p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>Handles: <code>signal</code>, <code>callUser</code>, <code>answerCall</code></li>
          <li>Supports fallback to audio-only</li>
        </ul>
      </Section>

      <Section title="📁 Folder Structure">
        <CodeBlock code={`ExchangeIQ/\n├── backend/\n├── frontend/\n│   └── src/\n├── README.md\n└── docs.md`} />
      </Section>

      <Section title="🤝 Contributing">
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>Fork the repo</li>
          <li>Create a feature branch</li>
          <li>Commit and push changes</li>
          <li>Open a Pull Request</li>
        </ol>
      </Section>

      <Section title="Copyright">
        <p>2025@<strong>ExchangeIQ</strong>.</p>
      </Section>

      
    </div>
    <Footer/>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold text-gray-700 mb-3">{title}</h2>
    <div>{children}</div>
  </section>
);

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto my-2 whitespace-pre-wrap">
    <code>{code}</code>
  </pre>
);

export default DocsPage;
