import React from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './Pages/Signup';
import Home from './Pages/Home';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  )
}

export default App