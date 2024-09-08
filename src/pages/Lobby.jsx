import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Lobby() {
  const { sessionCode } = useParams();
  const [teams, setTeams] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch session details and update teams periodically
    const fetchSessionDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/sessions/${sessionCode}`
        );
        const data = await response.json();
        setTeams(data.teams);
        setGameStarted(data.gameStarted);
      } catch (error) {
        console.error("Error fetching session details:", error);
      }
    };

    fetchSessionDetails(); // Initial fetch

    const intervalId = setInterval(fetchSessionDetails, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, [sessionCode]);

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({ type: "join", sessionCode: sessionCode.toUpperCase() })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "update") {
        setTeams(message.teams);
      } else if (message.type === "start") {
        setGameStarted(true);
        navigate(`/buzzer/${sessionCode}`);
      }
    };

    return () => ws.close(); // Clean up on component unmount
  }, [sessionCode, navigate]);
  const teamName = sessionStorage.getItem("teamName");
  const playerName = sessionStorage.getItem("playerName");
  return (
    <div>
      <h1>Lobby for Session {sessionCode}</h1>
      <h2>Teams</h2>

      <h1>Welcome, {playerName}</h1>
      <h2>Your team: {teamName}</h2>
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
