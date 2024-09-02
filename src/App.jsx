import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';

import Jeopardy from './pages/jeopardy';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path="Jeopardy" element={<Jeopardy/>}/>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
