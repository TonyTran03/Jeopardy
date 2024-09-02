import { Typography } from '@mui/material';
import './jeopardy.css';
import { useEffect, useState } from 'react';

export default function Jeopardy() {
  const [questions, setQuestions] = useState([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);

  const addCols = () => {
    setCols(cols + 1);
  };

  const addRow = () => {
    setRows(rows + 1);
  };

  useEffect(() => {
    fetch('http://localhost:5000/questions')
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error('Error fetching questions:', error));
  }, []);

  return (
    <>        
      <div className="flex h-screen w-screen">
        <div className="flex flex-col flex-1 qSection">
        <button className="add-row" onClick={addRow}>
              Add Row
            </button>
            <button className="add-col" onClick={addCols}>
              Add Column
            </button>
          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            Questions are here
          </Typography>

          <div>
            {questions.map((question, index) => (
              <li key={index}>
                {question.question}
              </li>
            ))}
          </div>
        </div>

        <div className="flex flex-col w-5/6 justify-center items-center">
          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            JEOPARDY
          </Typography>

          <div className="container" 
                style={{ 
                  '--cols': cols, 
                  '--rows': rows, 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`, 
                  gridTemplateRows: `repeat(${rows}, 1fr)` 
                }}>
              {Array.from({ length: rows * cols }).map((_, index) => (
                <div key={index} className="jeopardy-cell">
                  Question {index + 1}
                </div>
              ))}
              <div style={{ marginTop: '20px' }}></div>
          </div>
   

        
        </div>
      </div>
    </>
  );
}
