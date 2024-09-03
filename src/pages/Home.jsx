import React, { useState, useEffect } from 'react';
import './home.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [lobbyCode, setLobbyCode] = useState(generateLobbyCode());
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the available game boards from MongoDB
    fetch('http://localhost:5000/boards')
      .then((response) => response.json())
      .then((data) => setBoards(data))
      .catch((error) => console.error('Error fetching boards:', error));
  }, []);

  const handleStartGame = () => {
    if (selectedBoard) {
      // Append the lobby code to the board's stored URL
      const gameURL = `${selectedBoard.url}&lobbyCode=${lobbyCode}`;
      navigate(gameURL);
    }
  };

  function generateLobbyCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2>Lobby Code: {lobbyCode}</h2>
      <p>Share this code with participants to join the game</p>

      <h2>Select a Game Board</h2>
      <select
        value={selectedBoard?._id || ''}
        onChange={(e) =>
          setSelectedBoard(boards.find((board) => board._id === e.target.value))
        }
        className="p-2 border border-gray-300 rounded"
      >
        <option value="" disabled>
          Select a board
        </option>
        {boards.map((board) => (
          <option key={board._id} value={board._id}>
            {board.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleStartGame}
        className="mt-4 p-2 bg-green-500 text-white rounded"
        disabled={!selectedBoard}
      >
        Start Game
      </button>
    </div>
  );
}
