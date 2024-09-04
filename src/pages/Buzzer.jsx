import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

export default function Buzzer() {
  const { sessionCode } = useParams();
  const [buzzersActive, setBuzzersActive] = useState(false); // State to track buzzer activation
  const ws = useRef(null);

// In Buzzer.jsx
useEffect(() => {
    ws.current = new WebSocket('ws://localhost:5000');
  
    ws.current.onopen = () => {
      console.log('Connected to WebSocket for buzzer');
      ws.current.send(JSON.stringify({ type: 'join', sessionCode: sessionCode.toUpperCase() })); // Ensure this sends the correct sessionCode
    };
  
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message received from server:', message); // Log received messages
  
      if (message.type === 'activate_buzzers') {
        setBuzzersActive(true); 
        console.log('Buzzers activated');
      }
      else if ("deactivate_buzzers"){
        setBuzzersActive(false); 
      }
    };
  
    return () => {
      ws.current.close(); // Clean up WebSocket on unmount
    };
  }, [sessionCode]);

  const sendBuzz = () => {
    if (buzzersActive && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'buzz', sessionCode }));
      console.log('Buzz sent!');
    } else {
      console.error('Buzzers are not active or WebSocket is not open');
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1>Ready to Buzz?</h1>
      <button
        className="mt-4 p-4 bg-red-500 text-white rounded-full"
        onClick={sendBuzz}
        disabled={!buzzersActive} 
      >
        BUZZ
      </button>
    </div>
  );
}
