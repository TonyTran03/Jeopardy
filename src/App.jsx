import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';

import Create from './pages/Create';
import JeopardyGame from './pages/Game';
import JoinLobby from './pages/JoinLobby';

function App() {


  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path="/create" element={<Create/>}/>
        <Route path="/game" element={<JeopardyGame/>} />
        <Route path="/join" element={<JoinLobby/>} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
