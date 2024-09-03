import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinLobby() {
  const [sessionCode, setSessionCode] = useState('');
  const [sessionFound, setSessionFound] = useState(false);
  const navigate = useNavigate();

  const handleSessionCodeChange = (e) => {
    setSessionCode(e.target.value);
  };

  const handleJoinGame = async () => {
    try {
      const response = await fetch(`http://localhost:5000/sessions/${sessionCode}`);
      if (response.ok) {
        setSessionFound(true);
        const gameURL = `/game?lobbyCode=${sessionCode}`;
        navigate(gameURL);
      } else {
        setSessionFound(false);
        console.error('Session not found');
      }
    } catch (error) {
      setSessionFound(false);
      console.error('Error joining session:', error);
    }
  };

  return (
    <div className="join-game-container">
      <div>
        <input
          type="text"
          placeholder="Session Code"
          value={sessionCode}
          onChange={handleSessionCodeChange}
          onBlur={handleJoinGame} // Check session code when input loses focus
        />
        {sessionFound ? (
          <div className="session-found">✔️ Session found.</div>
        ) : (
          <div className="session-not-found">❌ Session not found.</div>
        )}
      </div>

      <button onClick={handleJoinGame} disabled={!sessionFound}>
        Join Game
      </button>
    </div>
  );
}
