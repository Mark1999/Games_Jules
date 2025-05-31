import React from 'react';
import Square from './Square';

const Board = ({ squares, onClick, winningLine }) => {
  return (
    <div className="grid grid-cols-3 gap-1 bg-gray-400 w-64 h-64 md:w-80 md:h-80 mx-auto shadow-lg rounded">
      {squares.map((value, i) => {
        const isWinningSquare = winningLine && winningLine.includes(i);
        return (
          <Square
            key={i}
            value={value}
            onClick={() => onClick(i)}
            isWinningSquare={isWinningSquare}
          />
        );
      })}
    </div>
  );
};

export default Board;
