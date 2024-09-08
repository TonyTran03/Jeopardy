import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

export default function Buzzer() {
  const { sessionCode } = useParams();
  const [buzzersActive, setBuzzersActive] = useState(false); // State to track buzzer activation
  const ws = useRef(null);
  const teamName = sessionStorage.getItem('teamName');
  const playerName = sessionStorage.getItem('playerName');
  const [scores, setScores] = useState([]);
useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000');
  
    ws.current.onopen = () => {
      console.log('Connected to WebSocket for buzzer');
      console.log('Broadcasting to client with sessionCode:', sessionCode);

      ws.current.send(JSON.stringify({ type: 'join', sessionCode: sessionCode.toUpperCase() })); // Ensure this sends the correct sessionCode
    };


    //the servder is only going towards this websocket server
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message received from server:', message); // Log received messages
  
      if (message.type === 'activate_buzzers') {
        setBuzzersActive(true); 
        console.log('Buzzers activated');
      }
      else if (message.type  === "deactivate_buzzers"){
        setBuzzersActive(false); 
      }
      else if(message.type  === "buzzer"){
        console.log("Ooops it's going to the wrong component")
      }
      else if(message.type ==='score_update'){
        const fetchTeamScores = async () => {
          try {
            const response = await fetch(`http://localhost:5000/sessions/${sessionCode}/scores`);
    
            if (response.ok) {
              const data = await response.json();
              setScores(data.scores);
            } else {
              console.error('Error fetching questions:', error);
            }
          } catch (error) {
            console.error('Error fetching points:', error);
          }
        };
    
        fetchTeamScores();
    
      }
    };
  
    return () => {
      ws.current.close(); // Clean up WebSocket on unmount
    };
  }, [sessionCode]);



  const sendBuzz = () => {
    if (buzzersActive && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'buzz', sessionCode,teamName, playerName }));
      console.log('Buzz sent!');
    } else {
      console.error('Buzzers are not active or WebSocket is not open');
    }
  };

  return (
    <>
    <div className='flex justify-start'>

      {scores.length > 0 ? (
        <ul>
          {scores.map((team) => (
            <li key={team.teamName}>
              {team.teamName}: {team.score}
            </li>
          ))}
        </ul>
      ) : (
        <p>No scores available</p>
      )}
    </div>
      <div className=" aboslute h-screen flex flex-col justify-center items-center">
      <h1>Ready to Buzz?</h1>
      <button
        className="mt-4 p-4 bg-red-500 text-white rounded-full"
        onClick={sendBuzz}
        disabled={!buzzersActive} 
      >
        BUZZ
      </button>
    </div>  
    </>

  );
}
