import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinLobby() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  const handleJoinSession = async () => {
    try {
      const response = await fetch(`http://localhost:5000/sessions/${sessionCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName }),
      });
      const data = await response.json();
      setPlayers(data.players);
      console.log('Joined session:', sessionCode);
      navigate(`/lobby/${sessionCode}`);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter Session Code"
        value={sessionCode}
        onChange={(e) => setSessionCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleJoinSession}>Join Game</button>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
    </div>
  );
}
