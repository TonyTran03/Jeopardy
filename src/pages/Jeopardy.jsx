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
      {question.question}
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
  let backgroundColor = 'transparent';
  let textColor = 'black';

  if (question) {
    backgroundColor = 'var(--tiffany)';
    textColor = 'darkslategray';
  } else if (isActive) {
    backgroundColor = 'lightgreen';
  } else if (canDrop) {
    backgroundColor = 'lightyellow';
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
        <strong>{question ? question.question : 'No question'}</strong>
      </div>
    </div>
  );
}

export default function Jeopardy() {
  const [questions, setQuestions] = useState([]);
  const [grid, setGrid] = useState([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [initialized, setInitialized] = useState(false);


  useEffect(() => {
    // Load rows, cols, and grid from URL parameters
    const url = new URL(window.location);
    const rowsParam = url.searchParams.get('rows');
    const colsParam = url.searchParams.get('cols');
    const gridParam = url.searchParams.get('grid');

    if (rowsParam) {
      setRows(parseInt(rowsParam, 10));
    }
    if (colsParam) {
      setCols(parseInt(colsParam, 10));
    }
    if (gridParam) {
      setGrid(gridParam.split(',').map((id) => (id ? decodeURIComponent(id) : null)));
    }

    setInitialized(true); 
  }, []);

  // Grid needs to be created first
  useEffect(() => {
    if (initialized) {
      // Fetch questions from the server after initialization
      fetch('http://localhost:5000/questions')
        .then((response) => response.json())
        .then((data) => setQuestions(data))
        .catch((error) => console.error('Error fetching questions:', error));
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      // Synchronize the grid state with the URL
      const serializedGrid = serializeGrid(grid);
      const url = new URL(window.location);
      url.searchParams.set('grid', serializedGrid);
      url.searchParams.set('rows', rows);
      url.searchParams.set('cols', cols);
      window.history.pushState(null, '', url.toString());
    }
  }, [rows, cols, grid, initialized]);

  const serializeGrid = (grid) => {
    return grid.map((item) => (item ? encodeURIComponent(item) : '')).join(',');
  };

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
    setRows((prevRows) => {
      setGrid((prevGrid) => [...prevGrid, ...Array(cols).fill(null)]);
      return prevRows + 1;
    });
  };

  const calculatePoints = (rowIndex) => {
    return 200 * (rowIndex + 1);
  };

  const handleDrop = (item, index) => {
    const newGrid = [...grid];
    newGrid[index] = item.question._id; // Store the question ID in the grid
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
              <DraggableQuestion key={index} question={question} index={index} />
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
              const rowIndex = Math.floor(index / cols);
              const points = calculatePoints(rowIndex);
              const questionId = grid[index];

              // Find the question in the list of questions using the stored ID
              const question = questions.find(q => q._id === questionId);

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
