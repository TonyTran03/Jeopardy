import { Typography } from '@mui/material';
import './jeopardy.css';
import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import JeopardyForm from './JeopardyForm';
import { useNavigate, useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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
      style={{
        backgroundColor,
        color: textColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div>
        <strong>Points: ${points}</strong>
      </div>
      <div>
        <strong>{question ? question.question : 'No question'}</strong>
      </div>
      <strong>
        {question ? (
          <>
            {question.answer.text && <div>{question.answer.text}</div>}
            {question.answer.image && (
              <img
                src={question.answer.image} // Ensure this is a valid image URL
                alt="Answer"
                style={{ maxWidth: '100%', maxHeight: '100px' }}
              />
            )}
          </>
        ) : (
          'No answer'
        )}
      </strong>
    </div>
  );
}

export default function Jeopardy() {
  const [questions, setQuestions] = useState([]);
  const [grid, setGrid] = useState([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [columnNames, setColumnNames] = useState([]); 
  const [initialized, setInitialized] = useState(false);
  const [isGridFilled, setIsGridFilled] = useState(false); 

  const query = useQuery();
  const navigate = useNavigate(); 

  useEffect(() => {
    const rowsParam = query.get('rows');
    const colsParam = query.get('cols');
    const gridParam = query.get('grid');
    const columnNamesParam = query.get('columnNames');
    
    if (rowsParam) setRows(parseInt(rowsParam, 10));
    if (colsParam) setCols(parseInt(colsParam, 10));
    if (gridParam) {
      setGrid(gridParam.split(',').map((id) => (id ? decodeURIComponent(id) : null)));
    }    
    if (columnNamesParam) {
      setColumnNames(columnNamesParam.split(',').map(name => decodeURIComponent(name)));
    }

    setInitialized(true);
  }, []); // Empty dependency array ensures this only runs on mount

  useEffect(() => {
    if (initialized) {
      fetch('http://localhost:5000/questions')
        .then((response) => response.json())
        .then((data) => setQuestions(data))
        .catch((error) => console.error('Error fetching questions:', error));
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized) {
      const serializedGrid = serializeGrid(grid);
      const allCellsFilled = grid.every(cell => cell !== null);
      const serializedColumnNames = serializeColumnNames(columnNames);
      if (allCellsFilled) {
        setIsGridFilled(true);
      } else {
        setIsGridFilled(false);
      }

      // Update the URL based on the grid state
      navigate(`?grid=${serializedGrid}&rows=${rows}&cols=${cols}&columnNames=${serializedColumnNames}`, { replace: true });
    }
  }, [grid, rows, cols,columnNames, initialized]);

  const serializeGrid = (grid) => {
    return grid.map((item) => (item ? encodeURIComponent(item) : '')).join(',');
  };
  const serializeColumnNames = (columnNames) => {
    return columnNames.map(name => encodeURIComponent(name)).join(',');
  };
  
  const handleColumnNameChange = (index, value) => {
    setColumnNames(prevNames => {
      const newNames = [...prevNames];
      newNames[index] = value;
      return newNames;
    });
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

  const byeCols = () => {
    setCols((prevCols) => {
      if (prevCols <= 1) return prevCols;

      const newCols = prevCols - 1;

      setGrid((prevGrid) => {
        const newGrid = [];
        for (let i = 0; i < prevGrid.length; i += prevCols) {
          const row = prevGrid.slice(i, i + prevCols); 
          row.pop(); 
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

  const byeRow = () => {
    setRows((prevRows) => {
      if (prevRows <= 1) return prevRows;

      const newRows = prevRows - 1;

      setGrid((prevGrid) => prevGrid.slice(0, newRows * cols));

      return newRows;
    });
  };

  const calculatePoints = (rowIndex) => {
    return 200 * (rowIndex + 1);
  };
  
  const handleDrop = (item, index) => {
    setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[index] = item.question._id; // Store the question ID in the grid
        return newGrid;
    });
  };

  const handleNewQuestion = (newQuestion) => {
    fetch('http://localhost:5000/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newQuestion),
    })
      .then((response) => response.json())
      .then((data) => {
        setQuestions((prevQuestions) => [...prevQuestions, data]);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handlePlayGame = () => {
    const serializedGrid = serializeGrid(grid);
    const serializedColumnNames = serializeColumnNames(columnNames); // Serialize column names here
    navigate(`/game?grid=${serializedGrid}&rows=${rows}&cols=${cols}&columnNames=${serializedColumnNames}`);
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

          <button className="add-col" onClick={byeRow}>
            Bye Row
          </button>
          <button className="add-col" onClick={byeCols}>
            Bye Column
          </button>

          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            Questions are here
          </Typography>

          <div>
            {questions.map((question, index) => (
              <DraggableQuestion key={index} question={question} index={index} />
            ))}
          </div>

          <div className='flex items-end flex-1'>
            <JeopardyForm onSubmit={handleNewQuestion} />
            {isGridFilled && (
              <button className="play-button" onClick={handlePlayGame}>
                Play
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col w-5/6 justify-center items-center">
          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            JEOPARDY
          </Typography>

          <div
            className="container"
            style={{
              '--cols': cols,
              '--rows': rows + 1, // +1 to accommodate the column name row
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `auto repeat(${rows}, 1fr)`, // 'auto' for the column name row
            }}
          >
            {/* Column Names Row */}
            {Array.from({ length: cols }).map((_, index) => (
              <input
                key={index}
                type="text"
                className="column-name-input"
                value={columnNames[index] || ''}
                onChange={(e) => handleColumnNameChange(index, e.target.value)}
                placeholder={`Column ${index + 1}`}
              />
            ))}

            {/* Jeopardy Grid */}
            {Array.from({ length: rows * cols }).map((_, index) => {
              const rowIndex = Math.floor(index / cols);
              const points = calculatePoints(rowIndex);
              const questionId = grid[index];
              const question = questions.find((q) => q._id === questionId);

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
