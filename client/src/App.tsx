import { Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import Questions from './Pages/Questions';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
cd         <Route path="/profile" element={<Profile />} />
        <Route path="/profile/questions" element={<Questions />} />
      </Routes>
    </>
  )
}

export default App