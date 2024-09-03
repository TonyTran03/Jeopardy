import React, { useState, useEffect } from 'react';
import './home.css';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [lobbyCode, setLobbyCode] = useState(generateLobbyCode());
  const [sessionCode, setSessionCode] = useState(lobbyCode); 
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [teams, setTeams] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/boards')
      .then((response) => response.json())
      .then((data) => setBoards(data))
      .catch((error) => console.error('Error fetching boards:', error));
  }, []);



  const handleStartGame = async () => {
    if (selectedBoard) {
      try {
        const sessionCreationResponse = await fetch('http://localhost:5000/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: sessionCode }), // Send the session code
        });
  
        if (sessionCreationResponse.ok) {
          const gameURL = `/game?boardId=${selectedBoard._id}&lobbyCode=${sessionCode}`;
          navigate(gameURL);
        } else {
          console.error('Failed to create session');
        }
      } catch (error) {
        console.error('Error during session creation:', error);
      }
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

      <div>
        <h2>Teams</h2>
        <ul>
          {teams.map((team, index) => (
            <li key={index}>{team}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
