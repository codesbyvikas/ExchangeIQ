import React from 'react'
import { Routes, Route } from "react-router-dom";
import './App.css'
import Signup from './Pages/Signup';

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  )
}

export default App