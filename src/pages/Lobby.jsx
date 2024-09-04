import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Lobby() {
  const { sessionCode } = useParams();
  const [teams, setTeams] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', sessionCode: sessionCode.toUpperCase() }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'update') {
        setTeams(message.teams);
      } else if (message.type === 'start') {
        setGameStarted(true);
        navigate(`/game/${sessionCode}`);
      }
    };

    return () => ws.close(); // Clean up on component unmount
  }, [sessionCode, navigate]);

  return (
    <div>
      <h1>Lobby for Session {sessionCode}</h1>
      <h2>Teams</h2>
      <ul>
        {teams.map((team, teamIndex) => (
          <li key={teamIndex}>
            <strong>Team: {team.name}</strong>
            <ul>
              {team.players.map((player, playerIndex) => (
                <li key={playerIndex}>{player}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {gameStarted && <p>Game has started! Redirecting...</p>}
    </div>
  );
}
