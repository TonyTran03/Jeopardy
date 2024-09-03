import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';

import Jeopardy from './pages/Jeopardy';
import JeopardyGame from './pages/Game';

function App() {


  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path="/Jeopardy" element={<Jeopardy/>}/>
        <Route path="/game" element={<JeopardyGame/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
