import React, { useEffect, useState } from 'react';
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
  const [questions, setQuestions] = useState([]); 
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
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

    const gridParam = query.get('grid');
    const rowsParam = query.get('rows');
    const colsParam = query.get('cols');
    const columnNamesParam = query.get('columnNames');

    if (rowsParam) setRows(parseInt(rowsParam, 10));
    if (colsParam) setCols(parseInt(colsParam, 10));
    if (gridParam) {
      setGrid(gridParam.split(',').map((id) => (id ? decodeURIComponent(id) : null)));
    }
    if (columnNamesParam) {
      setColumnNames(columnNamesParam.split(',').map(name => decodeURIComponent(name)));
    }
  }, []);  // Empty dependency array to only run on mount

  const calculatePoints = (rowIndex) => {
    return 200 * (rowIndex + 1);
  };

  const handleOpen = (index) => {
    const questionId = grid[index];
    const question = questions.find(q => q._id === questionId);
    const colIndex = index % cols;
    const columnName = columnNames[colIndex];

    if (question) {
      setSelectedQuestion(question);
      setSelectedColumn(columnName);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedQuestion(null);
    setSelectedColumn(null);
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
              onClick={() => handleOpen(index)}
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
            bgcolor: '#0a2f5c', // Dark blue background like Buzzinga
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
              {/* Column Name (Category) at the top */}
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

              {/* Question in the center */}
              <Typography id="question-text" variant="h3" sx={{ mt: 6 }}>
                {selectedQuestion.question}
              </Typography>

              {/* Close button */}
              <button 
                onClick={handleClose} 
                className="close-button" 
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  fontSize: '1rem',
                  backgroundColor: '#f1c40f', // Yellow button like Buzzinga
                  border: 'none',
                  borderRadius: '5px',
                  color: '#333',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}
