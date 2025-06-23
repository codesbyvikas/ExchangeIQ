import React from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import Profile from './Pages/Profile';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  )
}

export default App