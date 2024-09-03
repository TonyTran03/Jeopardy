import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './game.css';
import { Typography } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function JeopardyGame() {
  const query = useQuery();
  const [grid, setGrid] = useState([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [columnNames, setColumnNames] = useState([]);

  useEffect(() => {
    const gridParam = query.get('grid');
    const rowsParam = query.get('rows');
    const colsParam = query.get('cols');
    const columnNamesParam = query.get('columnNames'); // Get column names from the URL
  
    if (rowsParam) setRows(parseInt(rowsParam, 10));
    if (colsParam) setCols(parseInt(colsParam, 10));
    if (gridParam) {
      setGrid(gridParam.split(',').map((id) => (id ? decodeURIComponent(id) : null)));
    }
    if (columnNamesParam) {
      setColumnNames(columnNamesParam.split(',').map(name => decodeURIComponent(name)));
    }
  }, []); // Empty dependency array ensures it only runs once on mount

  const calculatePoints = (rowIndex) => {
    return 200 * (rowIndex + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center">
      <h1>Jeopardy Game</h1>

      <div className='flex-1 '></div>


      {/* gameboard */}
      <div
        className="containers w-4/6 "
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `auto repeat(${rows}, 1fr)`, // 'auto' for the column name row
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
          const colIndex = index % cols; // Correctly maps column index
          const points = calculatePoints(rowIndex);
          const questionId = grid[index];

          return (
            <div key={index} className="jeopardy-cells">
              <Typography variant='h2'>
                ${points}
            </Typography>
              <div>Question ID: {questionId}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
