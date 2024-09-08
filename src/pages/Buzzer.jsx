import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

export default function Buzzer() {
  const { sessionCode } = useParams();
  const [buzzersActive, setBuzzersActive] = useState(false); // State to track buzzer activation
  const ws = useRef(null);
  const teamName = sessionStorage.getItem("teamName");
  const playerName = sessionStorage.getItem("playerName");
  const [scores, setScores] = useState([]);
  useEffect(() => {
    const fetchTeamScores = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/sessions/${sessionCode}/scores`
        );

        if (response.ok) {
          const data = await response.json();
          setScores(data.scores);
        } else {
          console.error("Error fetching questions:", error);
        }
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };
    fetchTeamScores();
    ws.current = new WebSocket("ws://localhost:5000");

    ws.current.onopen = () => {
      console.log("Connected to WebSocket for buzzer");
      console.log("Broadcasting to client with sessionCode:", sessionCode);

      ws.current.send(
        JSON.stringify({ type: "join", sessionCode: sessionCode.toUpperCase() })
      ); // Ensure this sends the correct sessionCode
    };

    //the servder is only going towards this websocket server
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message received from server:", message); // Log received messages

      if (message.type === "activate_buzzers") {
        setBuzzersActive(true);
        console.log("Buzzers activated");
      } else if (message.type === "deactivate_buzzers") {
        setBuzzersActive(false);
      } else if (message.type === "buzzer") {
        console.log("Ooops it's going to the wrong component");
      } else if (message.type === "score_update") {
        fetchTeamScores();
      }
    };

    return () => {
      ws.current.close(); // Clean up WebSocket on unmount
    };
  }, [sessionCode]);

  const sendBuzz = () => {
    if (
      buzzersActive &&
      ws.current &&
      ws.current.readyState === WebSocket.OPEN
    ) {
      ws.current.send(
        JSON.stringify({ type: "buzz", sessionCode, teamName, playerName })
      );
      console.log("Buzz sent!");
    } else {
      console.error("Buzzers are not active or WebSocket is not open");
    }
  };

  return (
    <>
      <div className="flex flex-col w-screen justify-start p-6 bg-blue-900 text-white min-h-screen">
        {/* Display Player and Team Info */}
        <div className="text-left mb-8">
          <h2 className="text-xl font-bold mb-2">Welcome, {playerName}!</h2>
          <p className="text-lg font-semibold">
            You’re representing:{" "}
            <span className="text-yellow-400">{teamName}</span>
          </p>
        </div>

        {/* Display Scores in Descending Order */}
        <div className="text-left mb-8">
          <h2 className="text-lg font-semibold">Current Scores</h2>
          <ul className="list-none mt-4 space-y-2">
            {scores
              .sort((a, b) => b.score - a.score) // Sort teams by score in descending order
              .map((team) => (
                <li
                  key={team.teamName}
                  className="flex justify-between items-center bg-blue-800 p-4 rounded-lg shadow-md"
                >
                  <span className="text-lg font-bold">{team.teamName}</span>
                  <span className="text-xl font-extrabold">{team.score}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Centered Buzzer Section */}
        <div className="flex flex-col justify-center items-center w-full h-full">
          <h1 className="text-2xl font-semibold mb-6">
            Ready to Buzz, {playerName}?
          </h1>
          <button
            className={`mt-4 py-6 px-12 rounded-full text-2xl font-bold shadow-lg transition-transform transform hover:scale-110 ${
              buzzersActive
                ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
            onClick={sendBuzz}
            disabled={!buzzersActive}
          >
            BUZZ
          </button>
        </div>
      </div>
    </>
  );
}
