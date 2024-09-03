import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Lobby() {
  const { sessionCode } = useParams();
  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/sessions/${sessionCode}`);
        const data = await response.json();
        setPlayers(data.players);
        setGameStarted(data.gameStarted);
      } catch (error) {
        console.error('Error fetching session details:', error);
      }
    };

    fetchSessionDetails();
  }, [sessionCode]);

  const handleStartGame = async () => {
    try {
      const response = await fetch(`http://localhost:5000/sessions/${sessionCode}/start`, {
        method: 'POST',
      });
      const data = await response.json();
      console.log(data.message);
      setGameStarted(true);
      navigate(`/game/${sessionCode}`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  return (
    <div>
      <h1>Lobby for Session {sessionCode}</h1>
      <ul>
        {players.map((player, index) => (
          <li key={index}>{player}</li>
        ))}
      </ul>
      {!gameStarted && <button onClick={handleStartGame}>Start Game</button>}
      {gameStarted && <p>Game has started!</p>}
    </div>
  );
}
