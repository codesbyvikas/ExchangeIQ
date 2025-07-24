# 🔁 ExchangeIQ  

**ExchangeIQ** is a modern skill exchange platform that empowers individuals to **teach what they know** and **learn what they love**.  
Whether it’s coding, photography, music, or any life skill — ExchangeIQ connects you to people who complement your learning goals.

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
- 📞 Audio & video calls using **Agora SDK** (with Socket.IO signaling)  
- 🌐 Responsive UI — works great on mobile & desktop  
- 📦 Built with the **MERN stack**

---

## 🚀 Live Demo  

👉 [Visit ExchangeIQ](https://exchange-iq.vercel.app/)

---

## 🧰 Tech Stack

### Frontend
- React + TypeScript  
- Tailwind CSS  
- React Router  
- Lucide Icons  
- Socket.IO Client  
- **Agora SDK (Video/Audio Calls)**  

### Backend
- Node.js + Express  
- MongoDB + Mongoose  
- JWT Authentication  
- Socket.IO Server  
- Cloudinary (media uploads)  
- Multer (file handling)  

### Dev & Tools
- VS Code  
- Vite  
- Postman / Thunder Client  
- ESLint + Prettier  
- Git + GitHub CI/CD  

---

## 📸 Screenshots

| Home | Skill Matching | Chat |
|------|----------------|------|
| ![Home](https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/homepage.png) | ![Matching](https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/skillinvite.png) | ![Chat](https://github.com/codesbyvikas/ExchangeIQ/blob/main/client/src/assets/chatpage.png) |

---

## 🧑‍💻 Getting Started

### Prerequisites

- Node.js (v18+)  
- MongoDB  
- Cloudinary Account  
- Google OAuth Credentials  
- **Agora App ID & App Certificate**

<!-- ✅ End of prerequisites -->

---

### Backend Setup

```bash
cd server
npm install
npm run dev
```
<!-- ✅ Properly closed backend code block -->

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```
<!-- ✅ Properly closed frontend code block -->

---

### `.env` — Server (place this file at `/server/.env`)

```env
MONGO_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

FRONTEND_BASE_URL=http://localhost:5173

AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```
<!-- ✅ End of server .env -->

---

### `.env` — Client (place this file at `/client/.env`)

> ⚠️ All frontend environment variables must start with `VITE_` (required by Vite).

```env
VITE_BASE_API=http://localhost:5000
VITE_AGORA_APP_ID=your_agora_app_id
```
<!-- ✅ End of client .env -->

---

## 📞 How Video/Audio Calls Work

ExchangeIQ uses **Agora SDK** for high-quality audio and video calls. Here's how it works:

1. When a user initiates a call, the frontend requests a secure **Agora token** from the backend.
2. The frontend joins the Agora channel using that token via the `agora-rtc-sdk-ng` library.
3. **Socket.IO** is used for real-time signaling and user presence.
4. Users can:
   - Toggle audio/video
   - Enter full-screen mode
   - Leave the call anytime
5. The entire call UI runs inside a **modal overlay** — no route change needed.

<!-- ✅ End of call explanation -->
