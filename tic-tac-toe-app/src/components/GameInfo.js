import React from 'react';

const GameInfo = ({ player1Name, player2Name, xIsNext, winner, isDraw, gameStatus, onRematch, onNewGame, isAiModeActive, isAiThinking }) => {
  let statusText;
  let statusStyle = "text-xl sm:text-2xl font-semibold text-slate-700 mb-3";

  if (gameStatus === 'winner' && winner) {
    const winnerName = winner === 'X' ? player1Name : player2Name;
    statusText = (
      <>
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-400">
          Winner:
        </span> {winnerName} ({winner})!
      </>
    );
    statusStyle += " text-green-600";
  } else if (gameStatus === 'draw') {
    statusText = "It's a Draw!";
    statusStyle += " text-orange-600";
  } else {
    if (isAiModeActive && !xIsNext && isAiThinking) {
      statusText = (
        <>
          <span className="text-pink-500">{player2Name} (O)</span> is thinking...
        </>
      );
      statusStyle += " italic text-slate-600";
    } else {
      const currentPlayerName = xIsNext ? player1Name : player2Name;
      const currentPlayerMark = xIsNext ? 'X' : 'O';
      statusText = (
        <>
          Current Player: <span className={currentPlayerMark === 'X' ? 'text-blue-500' : 'text-pink-500'}>{currentPlayerName} ({currentPlayerMark})</span>
        </>
      );
    }
  }

  return (
    <div className="text-center my-4 sm:my-6 p-4 bg-white">
      <p className={statusStyle}>{statusText}</p>
      {(gameStatus === 'winner' || gameStatus === 'draw') && (
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform hover:scale-105"
            onClick={onRematch}
          >
            Rematch
          </button>
          <button
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform hover:scale-105"
            onClick={onNewGame}
          >
            New Game
          </button>
        </div>
      )}
    </div>
  );
};

export default GameInfo;
