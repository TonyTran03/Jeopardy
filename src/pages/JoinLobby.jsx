import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinLobby() {
  const [lobbyCode, setLobbyCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (lobbyCode) {
      navigate(`/jeopardy/${lobbyCode}`);
    }
  };

  return (
    <div className="join-lobby flex flex-col items-center">
      <h2>Enter Lobby Code</h2>
      <input
        type="text"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
        placeholder="Enter code"
        className="p-2 border border-gray-300 rounded"
      />
      <button onClick={handleJoin} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Join Game
      </button>
    </div>
  );
}
