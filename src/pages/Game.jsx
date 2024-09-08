  import React, { useEffect, useState, useRef } from 'react';
  import { useLocation } from 'react-router-dom';
  import './game.css';
  import { Typography, Modal, Box } from '@mui/material';

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  export default function JeopardyGame() {
    const query = useQuery();
    const [grid, setGrid] = useState([]);
    const [rows, setRows] = useState(5);
    const [cols, setCols] = useState(5);
    const [columnNames, setColumnNames] = useState([]);
    const [lobbyCode, setLobbyCode] = useState('');
    const [questions, setQuestions] = useState([]); 
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [open, setOpen] = useState(false);
    const [showButton, setShowButton]= useState(true);
    //makes the activate button show up or not if somebody is buzzed in
    const [buzzedIn, setBuzzedIn] = useState(false);
    const gridParam = query.get('grid');
    const rowsParam = query.get('rows');
    const colsParam = query.get('cols');
    const columnNamesParam = query.get('columnNames');
    const lobbyCodeParam = query.get('lobbyCode');


    const [buzzTeam, setBuzzTeam] = useState('');
    const [buzzPlayer, setBuzzPlayer]= useState('');

    const ws = useRef(null); 
    useEffect(() => {

    
      if (rowsParam) setRows(parseInt(rowsParam, 10));
      if (colsParam) setCols(parseInt(colsParam, 10));
      if (gridParam) {
        setGrid(gridParam.split(',').map((id) => (id ? decodeURIComponent(id) : null)));
      }
      if (columnNamesParam) {
        setColumnNames(columnNamesParam.split(',').map(name => decodeURIComponent(name)));
      }
      if (lobbyCodeParam) {
        setLobbyCode(lobbyCodeParam);  // This will trigger the WebSocket connection
      }
    
      const fetchQuestions = async () => {
        try {
          const response = await fetch('http://localhost:5000/questions');
          const data = await response.json();
          setQuestions(data);
        } catch (error) {
          console.error('Error fetching questions:', error);
        }
      };
    
      fetchQuestions();
    }, []);
    
    // Initialize WebSocket connection after lobbyCode is set
    useEffect(() => {
      if (lobbyCodeParam) {
        ws.current = new WebSocket('ws://localhost:5000');
    
        ws.current.onopen = () => {
          console.log('Connected to WebSocket for Game');
          ws.current.send(JSON.stringify({ type: 'join', sessionCode: lobbyCodeParam.toUpperCase() })); // Ensure this sends the correct sessionCode

          // Send the 'join' message once the connection is open and lobbyCode is available
          console.log('Joined session with lobbyCode:', lobbyCodeParam);
        };
    
        ws.current.onmessage = async (event) => {
          const message = JSON.parse(event.data);
          if (message.type === 'buzzer') {
            setBuzzPlayer(message.playerName)
            setBuzzTeam(message.teamName)
            console.log(`Buzz received in Game component ${message.playerName} from ${message.teamName}`);
            setBuzzedIn(true);

            try {
              const response = await fetch(`http://localhost:5000/sessions/${lobbyCodeParam}/deactivate`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
        
              if (response.ok) {
                console.log('Buzzers deactivated');
              } else {
                console.error('Failed to deactivate buzzers');
              }
            } catch (error) {
              console.error('Error deactivating buzzers:', error);
            }
          }



        };
    
        return () => {
          ws.current.close(); // Close WebSocket on component unmount
        };
      }
    }, []);  // This effect runs when lobbyCode changes

    const calculatePoints = (rowIndex) => {
      return 200 * (rowIndex + 1);
    };

    const handleOpen = (index, points) => {

      const questionId = grid[index];
      const question = questions.find(q => q._id === questionId);
      const colIndex = index % cols;
      const columnName = columnNames[colIndex];

      if (question) {
        setSelectedQuestion({ ...question, points }); 
        setSelectedColumn(columnName);
        setOpen(true);
      }
    };

    const handleClose = async () => {
      setOpen(false);
      setSelectedQuestion(null);
      setSelectedColumn(null);
      setBuzzedIn(false); 
      setBuzzPlayer('')
      setBuzzTeam('')
      setShowButton(true);
    try {
      const response = await fetch(`http://localhost:5000/sessions/${lobbyCodeParam}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Buzzers deactivated');
      } else {
        console.error('Failed to deactivate buzzers');
      }
    } catch (error) {
      console.error('Error deactivating buzzers:', error);
    }
      
    };

    const activateBuzzers = async () => {
      try {
        // turns buzzer on
        const response = await fetch(`http://localhost:5000/sessions/${lobbyCodeParam}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (response.ok) {
          console.log('Buzzers activated');
          setShowButton(false);
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'activate_buzzers', lobbyCodeParam }));
          }
        } else {
          console.error('Failed to activate buzzers');
        }
      } catch (error) {
        console.error('Error activating buzzers:', error);
      }
    };

    const handleCorrect = async (points, buzzedTeam) => {
      console.log(lobbyCodeParam); // Check if lobbyCodeParam is valid

      try {
        const response = await fetch(`http://localhost:5000/sessions/${lobbyCodeParam}/score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamName: buzzedTeam,  // The team that buzzed in
            points: points,      // The points for the question
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Correct! Team now has ${data.score} points.`);
        } else {
          console.error('Failed to update the score');
        }
      
      
      
      } catch (error) {
        console.error('Error updating the score:', error);
      }
    };

    return (
      <div className="flex flex-col h-screen w-screen justify-center items-center">
        <h1>Jeopardy Game</h1>



        {/* Gameboard */}
        <div 
          className="containers"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `auto repeat(${rows}, 1fr)`
          }}
        >
          {/* Column Names Row */}
          {columnNames.map((name, colIndex) => (
            <div key={`col-name-${colIndex}`} className="jeopardy-cells column-names">
              {name || `Column ${colIndex + 1}`}
            
            
            </div>
          ))}
          

          {/* Jeopardy Grid */}
          {Array.from({ length: rows * cols }).map((_, index) => {
            const rowIndex = Math.floor(index / cols);
            const points = calculatePoints(rowIndex);

            return (
              <div 
                key={index} 
                className="jeopardy-cells"
                onClick={() => handleOpen(index, points)} // Pass the points to handleOpen
                style={{ cursor: 'pointer' }}
              >
                <Typography variant='h2'>
                  ${points}
                </Typography>
              </div>
            );
          })}
        </div>

        {/* Modal for displaying the question */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="question-title"
          aria-describedby="question-text"
        
        >
          
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: '#0a2f5c',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              p: 4,
              outline: 'none',
            }}
          >
            {selectedQuestion && (
              <>

              <div className='flex flex-col w-screen justify-center items-center'>
                  <Typography 
                      id="question-category" 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        position: 'absolute', 
                        top: '20px', 
                        width: '100%', 
                        textAlign: 'center',
                        backgroundColor: 'black',
                        fontSize: '64px'
                      }}
                    >
                      {selectedColumn || 'Category'}

                    </Typography>

                    {showButton &&
                    <button
                        className="mt-4 p-2 bg-green-500 text-white rounded"
                        onClick={activateBuzzers}
                        style={{ marginBottom: '20px',  width: '50%'}}
                      >
                      Activate Buzzers
                    </button>

                      }

                      
                      {buzzedIn &&
                      <h1 className='flex flex-col'>
                        {buzzPlayer} from Team ${buzzTeam} has buzzed in!
                      </h1>
                      

                      }

              </div>


                <Typography id="question-text" variant="h3" sx={{ mt: 6 }}>
                  {selectedQuestion.question}
                </Typography>

                <button 
                  onClick={handleClose} 
                  className="close-button" 
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '1rem',
                    backgroundColor: '#f1c40f',
                    border: 'none',
                    borderRadius: '5px',
                    color: '#333',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>


                {buzzedIn &&
                      <h1 className='flex mt-6'>
                    
                        <button
                         className="correctButton"
                         onClick={() => handleCorrect(selectedQuestion.points, buzzTeam)}
                         >
                        Correct
                      </button>
                      <button  className="incorrectButton">
                        Incorrect
                      </button>
                      </h1>

                      }
              </>
            )}
          </Box>
        </Modal>
      </div>
    );
  }
