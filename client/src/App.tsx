import { Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './Pages/SignupPage';
import Home from './Pages/HomePage';
import Profile from './Pages/ProfilePage';
import LearnSkillSelectPage from "./Pages/LearnSkillSelectionPage";
import TeachSkillSelectionPage from "./Pages/TeachSkillSelectionPage";
import LoginRedirectHandler from "./utils/handler/LoginHandler";
import { useState } from "react";
import InvitationPage from "./Pages/InvitationPage";
import ChatPage from "./Pages/ChatPage";
import DocsPage from "./Pages/DocumentationPage";

const App = () => {
  const [learnSkillIds, setLearnSkillIds] = useState<string[]>([]);
  const [teachSkillIds, setTeachSkillIds] = useState<string[]>([]);

  return (
    <>
      <Routes>
        <Route path="/auth" element={<Signup />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/invitations" element={<InvitationPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/doc" element={<DocsPage />} />
        <Route
          path="/profile/skills/learn"
          element={
            <LearnSkillSelectPage
              selectedSkillIds={learnSkillIds}
              setSelectedSkillIds={setLearnSkillIds}
              excludeSkillIds={teachSkillIds}
            />
          }
        />
        <Route
          path="/profile/skills/teach"
          element={
            <TeachSkillSelectionPage
              selectedSkillIds={teachSkillIds}
              setSelectedSkillIds={setTeachSkillIds}
              excludeSkillIds={learnSkillIds}
            />
          }
        />
        <Route path="/login/success" element={<LoginRedirectHandler />} />
      </Routes>
    </>
  )
}

export default App