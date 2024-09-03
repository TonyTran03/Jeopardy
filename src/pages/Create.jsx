import './create.css';
import { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import JeopardyForm from './JeopardyForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, TextField } from '@mui/material';

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
    <li
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: '#e0e0e0',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
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
    backgroundColor = '#FFDDC1'; // Light orange background when a question is placed
    textColor = 'darkslategray';
  } else if (isActive) {
    backgroundColor = '#C1FFD7'; // Light green background when a cell is active
  } else if (canDrop) {
    backgroundColor = '#FFF8C1'; // Light yellow background when a cell can accept a drop
  }

  return (
    <div
      ref={drop}
      className="jeopardy-cell"
      style={{
        backgroundColor,
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px solid #ccc',
        padding: '10px',
      }}
    >
      <div>
        <strong>${points}</strong>
      </div>
      <div>
        {question ? (
          <>
            <div>{question.question}</div>
            {question.answer.image && (
              <img
                src={question.answer.image} 
                alt="Answer"
                style={{ maxWidth: '100%', maxHeight: '100px' }}
              />
            )}
          </>
        ) : (
          <div style={{ fontStyle: 'italic', color: '#888' }}>No question</div>
        )}
      </div>
    </div>
  );
}

export default function Create() {
  const [questions, setQuestions] = useState([]);
  const [grid, setGrid] = useState([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [columnNames, setColumnNames] = useState([]); 
  const [initialized, setInitialized] = useState(false);
  const [isGridFilled, setIsGridFilled] = useState(false); 
  const [boardName, setBoardName] = useState(''); // New state for board name

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
  }, []); 

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

      navigate(`?grid=${serializedGrid}&rows=${rows}&cols=${cols}&columnNames=${serializedColumnNames}`, { replace: true });
    }
  }, [grid, rows, cols, columnNames, initialized]);

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
        newGrid[index] = item.question._id;
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

  const handleSaveBoard = async () => {
    const serializedGrid = serializeGrid(grid);
    const serializedColumnNames = serializeColumnNames(columnNames);
  
    const boardURL = `/game?grid=${serializedGrid}&rows=${rows}&cols=${cols}&columnNames=${serializedColumnNames}`;
    
    const boardData = {
      url: boardURL,
      name: `${boardName || 'Board'} - ${new Date().toLocaleString()}`, // Include date in the name
    };
  
    try {
      // Check if a board with the same URL already exists
      const response = await fetch('http://localhost:5000/boards');
      const boards = await response.json();
      const duplicateBoard = boards.find(board => board.url === boardData.url);
  
      if (duplicateBoard) {
        alert('A board with the same configuration already exists.');
        return; 
      }
  
      // save the board if no duplicate is found
      const saveResponse = await fetch('http://localhost:5000/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(boardData),
      });
  
      const savedBoard = await saveResponse.json();
      console.log('Board saved:', savedBoard);
  
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-screen">
        <div className="sidebar flex flex-col flex-1 p-4 bg-gray-200">
          <div className="mb-4">
            <button className="add-row" onClick={addRow}>
              Add Row
            </button>
            <button className="add-col" onClick={addCols}>
              Add Column
            </button>
            <button className="add-col" onClick={byeRow}>
              Remove Row
            </button>
            <button className="add-col" onClick={byeCols}>
              Remove Column
            </button>
          </div>

          <Typography variant="h1" sx={{ fontSize: '2rem' }}>
            Questions
          </Typography>

          <div className="question-list">
            {questions.map((question, index) => (
              <DraggableQuestion key={index} question={question} index={index} />
            ))}
          </div>

          <div className="mt-4">
            <TextField
              label="Board Name"
              variant="outlined"
              fullWidth
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Enter board name"
            />
          </div>

          <div className='flex items-end flex-1'>
            <JeopardyForm onSubmit={handleNewQuestion} />
          </div>
          {isGridFilled && (
            <button className="save-button bg-blue-500 text-white p-4 rounded mt-4" onClick={handleSaveBoard}>
              Save
            </button>
          )}
        </div>

        <div className="flex flex-col w-5/6 justify-center items-center p-4">
          <Typography variant="h1" sx={{ fontSize: '2rem', marginBottom: '20px' }}>
            Jeopardy Grid
          </Typography>

          <div
            className="grid-container"
            style={{
              '--cols': cols,
              '--rows': rows + 1,
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `auto repeat(${rows}, 1fr)`,
              gap: '10px',
            }}
          >
            {Array.from({ length: cols }).map((_, index) => (
              <input
                key={index}
                type="text"
                className="column-name-input"
                value={columnNames[index] || ''}
                onChange={(e) => handleColumnNameChange(index, e.target.value)}
                placeholder={`Column ${index + 1}`}
                style={{
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  fontWeight: 'bold',
                }}
              />
            ))}

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
