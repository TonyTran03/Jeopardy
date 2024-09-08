import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import JeopardyGame from "./pages/Game";
import JoinLobby from "./pages/JoinLobby";
import Lobby from "./pages/Lobby";
import Buzzer from "./pages/Buzzer";
import { WebSocket } from "ws";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/join" element={<JoinLobby />} />
          <Route path="/lobby/:sessionCode" element={<Lobby />} />
          {/* Use /game without :sessionCode since sessionCode is passed via query parameters */}
          <Route path="/game" element={<JeopardyGame />} />
          <Route path="/buzzer/:sessionCode" element={<Buzzer />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
