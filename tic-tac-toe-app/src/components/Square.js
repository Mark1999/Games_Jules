import React from 'react';

const Square = ({ value, onClick, isWinningSquare }) => {
  let squareClasses = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-white border-2 border-slate-300 text-5xl sm:text-6xl font-bold flex items-center justify-center focus:outline-none transition-all duration-150 ease-in-out";

  if (value) {
    squareClasses += value === 'X' ? ' text-blue-500' : ' text-pink-500';
  } else {
    // Hover effect only for empty squares
    squareClasses += ' hover:bg-slate-50 cursor-pointer';
  }

  if (isWinningSquare) {
    // Highlight for winning squares - overrides hover and base background
    squareClasses += ' bg-yellow-300 scale-105 ring-4 ring-yellow-500 z-10';
  } else {
    // Subtle shadow for non-winning squares, more pronounced on hover for empty ones
    squareClasses += value ? ' shadow-sm' : ' hover:shadow-lg';
  }

  return (
    <button
      className={squareClasses}
      onClick={onClick}
      // Ensure aria-label is descriptive, especially for screen reader users
      aria-label={`Square ${value ? `is ${value}` : 'is empty'}${isWinningSquare ? ', part of the winning line' : ''}`}
      // Disable button if it's filled or game is over (though App.js logic already prevents action)
      // disabled={!!value}
    >
      {value}
    </button>
  );
};

export default Square;
