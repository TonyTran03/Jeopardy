import { Typography } from '@mui/material';
import './jeopardy.css';
import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
  QUESTION: 'question',
};

function DraggableQuestion({ question, index }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.QUESTION,
    item: { question, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <li ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {question}
    </li>
  );
}
function DroppableCell({ index, question, onDrop, points }) {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.QUESTION,
    drop: (item) => onDrop(item, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const isActive = canDrop && isOver;
  let backgroundColor = 'transparent'; // Default to transparent if no question
  let textColor = 'black'; // Default text color

  if (question) {
    backgroundColor = 'var(--tiffany)'; // Color if a question is assigned
    textColor = 'darkslategray'; // Darker text color if a question is in place
  } else if (isActive) {
    backgroundColor = 'lightgreen'; // Color when a question is being dragged over
  } else if (canDrop) {
    backgroundColor = 'lightyellow'; // Color when the cell can accept a drop
  }

  return (
    <div
      ref={drop}
      className="jeopardy-cell"
      style={{ backgroundColor, color: textColor, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
    >
            <div>
        <strong>Points: ${points}</strong>
      </div>
      <div>
        <strong>{question}</strong>
      </div>
    </div>
  );
}
export default function Jeopardy() {
  const [questions, setQuestions] = useState([]);
  const [grid, setGrid] = useState(Array(25).fill(null)); // Initialize a 5x5 grid
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);

  const addCols = () => {
    setCols((prevCols) => {
      const newCols = prevCols + 1;
      setGrid((prevGrid) => {
        const newGrid = [];
        for (let i = 0; i < prevGrid.length; i += prevCols) {
          const row = prevGrid.slice(i, i + prevCols);
          row.push(null); 
          newGrid.push(...row);
        }
        return newGrid;
      });
      return newCols;
    });
  };

  const addRow = () => {
    setRows(rows + 1);
    setGrid((prevGrid) => [...prevGrid, ...Array(cols).fill(null)]);
  };

  useEffect(() => {
    fetch('http://localhost:5000/questions')
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error('Error fetching questions:', error));
  }, []);

  const calculatePoints = (rowIndex) => {
    return 200 * (rowIndex + 1); // Calculate point value based on row index
  };

  const handleDrop = (item, index) => {
    const newGrid = [...grid];
    newGrid[index] = item.question;
    setGrid(newGrid);
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
              <DraggableQuestion key={index} question={question.question} index={index} />
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
            {Array.from({ length: rows * cols }).map((_, index) => {
              const rowIndex = Math.floor(index / cols); // Determine the row index
              const points = calculatePoints(rowIndex); // Calculate points for the row
              const question = grid[index]; // Get question from grid array

              return (
                <DroppableCell
                  key={index}
                  index={index}
                  points={points}
                  question={question}
                  onDrop={handleDrop}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
