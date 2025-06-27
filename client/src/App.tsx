import { Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './Pages/SignupPage';
import Home from './Pages/HomePage';
import Profile from './Pages/ProfilePage';
import LearnSkillSelectPage from "./Pages/LearnSkillSelectionPage";
import TeachSkillSelectionPage from "./Pages/TeachSkillSelectionPage";
import LoginRedirectHandler from "./utils/LoginHandler";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<Signup />} />
        <Route path="/" element={<Home />} />
       <Route path="/profile" element={<Profile />} />
        <Route path="/profile/skills/learn" element={<LearnSkillSelectPage />}/>
        <Route path="/profile/skills/teach" element={<TeachSkillSelectionPage />} />
        <Route path="/login/success" element={<LoginRedirectHandler />} />
      </Routes>
    </>
  )
}

export default App