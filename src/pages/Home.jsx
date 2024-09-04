import React, { useState, useEffect } from 'react';
import './home.css';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [sessionCode, setSessionCode] = useState(''); // State to hold the session code
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [teams, setTeams] = useState([]); 
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch boards from the server
    fetch('http://localhost:5000/boards')
      .then((response) => response.json())
      .then((data) => setBoards(data))
      .catch((error) => console.error('Error fetching boards:', error));

    // Create a new session as soon as the component is mounted
    const createSession = async () => {
      try {
        const sessionCreationResponse = await fetch('http://localhost:5000/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (sessionCreationResponse.ok) {
          const { sessionCode } = await sessionCreationResponse.json();
          setSessionCode(sessionCode); // Store the session code in state
        } else {
          console.error('Failed to create session');
        }
      } catch (error) {
        console.error('Error during session creation:', error);
      }
    };

    createSession(); // Call the function to create a session when the component mounts
  }, []);

  useEffect(() => {
    // Fetch session details and update teams
    if (sessionCode) {
      const fetchSessionDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/sessions/${sessionCode}`);
          const data = await response.json();
          setTeams(data.teams); // Update teams
        } catch (error) {
          console.error('Error fetching session details:', error);
        }
      };

      fetchSessionDetails();
      const intervalId = setInterval(fetchSessionDetails, 5000); // Poll every 5 seconds

      return () => clearInterval(intervalId); // Clean up on component unmount
    }
  }, [sessionCode]);

  const handleStartGame = async () => {
    if (selectedBoard && sessionCode) {
      try {
        // Fetch the board details from MongoDB
        const boardResponse = await fetch(`http://localhost:5000/boards/${selectedBoard._id}`);
        if (!boardResponse.ok) {
          console.error('Failed to fetch board details');
          return;
        }
        const boardData = await boardResponse.json();
  
        // Start the game on the server
        const startGameResponse = await fetch(`http://localhost:5000/sessions/${sessionCode}/start`, {
          method: 'POST',
        });
  
        if (!startGameResponse.ok) {
          console.error('Failed to start the game');
          return;
        }
  
        // Navigate to the game screen
        const gameURL = `${boardData.url}&lobbyCode=${sessionCode}`;
        navigate(gameURL);
      } catch (error) {
        console.error('Error during board retrieval or game start:', error);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2>Lobby Code: {sessionCode || 'Generating...'}</h2>
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
            <li key={index}>
              <strong>{team.name}</strong>
              <ul>
                {team.players.map((player, idx) => (
                  <li key={idx}>{player}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
