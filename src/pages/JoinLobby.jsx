import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinLobby() {
  const [sessionCode, setSessionCode] = useState('');
  const [teamName, setTeamName] = useState('');  // Team name input
  const [playerName, setPlayerName] = useState('');  // Player name input
  const [teams, setTeams] = useState([]);  // Store teams
  const navigate = useNavigate();

  const handleJoinSession = async () => {
    try {
      const response = await fetch(`http://localhost:5000/sessions/${sessionCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName, playerName }),  // Send both team and player name
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);  // Update teams in state
        sessionStorage.setItem('teamName', teamName);
        sessionStorage.setItem('playerName', playerName);
        console.log(`Joined session ${sessionCode} as part of team ${teamName}`);
        navigate(`/lobby/${sessionCode}`);

      } else {
        console.error('Failed to join session');
      }
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
        style={{ color: 'white' }}
        onChange={(e) => setSessionCode(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Your Team Name"
        value={teamName}
        style={{ color: 'white' }}
        onChange={(e) => setTeamName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Your Name"
        value={playerName}
        style={{ color: 'white' }}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleJoinSession}>Join Game</button>

      <div>
        <h3>Teams in Session:</h3>
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
