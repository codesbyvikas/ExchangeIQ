# 🔁 ExchangeIQ

**ExchangeIQ** is a modern skill exchange platform that empowers individuals to **teach what they know** and **learn what they love**. Whether it’s coding, photography, music, or any life skill — ExchangeIQ connects you to people who complement your learning goals.

![ExchangeIQ Banner](https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/logopng2.png)

---

## 🌟 Features

- 🔐 Google OAuth 2.0 Authentication (JWT-based)
- 🧠 Create skill posts to **teach** or **learn**
- 🤝 Smart matching with **invitation system**
- 💬 Real-time chat with:
  - Emoji picker
  - Media sharing
  - Message timestamps
- 📞 Audio & video calls (WebRTC + Socket.IO)
- 🌐 Responsive UI — works great on mobile & desktop
- 📦 Built with the **MERN stack**

---

## 🚀 Live Demo

👉 [Visit ExchangeIQ](https://exchangeiq.vercel.app)

---

## 🧰 Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Lucide Icons
- Emoji Picker
- Socket.IO Client
- Simple-Peer (WebRTC)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.IO Server
- Cloudinary (media uploads)
- Multer (file handling)

### Dev & Tools
- Vite
- Postman / Thunder Client
- ESLint + Prettier
- Git + GitHub CI/CD

---

## 📸 Screenshots

| Home | Skill Matching | Chat |
|------|----------------|------|
| ![Home](https://your-image-url.com/home.png) | ![Matching](https://your-image-url.com/match.png) | ![Chat](https://your-image-url.com/chat.png) |

---

## 🧑‍💻 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary Account
- Google OAuth Credentials

### Backend Setup

```bash
cd server
npm install
npm run dev

### Frontend Setup

```bash
cd client
npm install
npm run dev

### env server

```bash
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
FRONTEND_BASE_URL=http://localhost:5173

### env client

```bash
VITE_BASE_API = your_backend_api


