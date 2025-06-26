import { Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './Pages/SignupPage';
import Home from './Pages/HomePage';
import Profile from './Pages/ProfilePage';
import LearnSkillSelectPage from "./Pages/LearnSkillSelectionPage";
import TeachSkillSelectionPage from "./Pages/TeachSkillSelectionPage";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<Signup />} />
        <Route path="/" element={<Home />} />
       <Route path="/profile" element={<Profile />} />
        <Route path="/profile/skills/learn" element={<LearnSkillSelectPage />}/>
        <Route path="/profile/skills/teach" element={<TeachSkillSelectionPage />} />
      </Routes>
    </>
  )
}

export default App