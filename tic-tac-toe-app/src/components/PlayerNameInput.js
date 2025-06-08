import React, { useState, useEffect } from 'react';

const PlayerNameInput = ({ onStartGame }) => {
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'human'

  useEffect(() => {
    if (gameMode === 'ai') {
      setP2Name('AI Player');
    } else {
      // Clear p2Name when switching to human vs human
      setP2Name('');
    }
  }, [gameMode]);

  const handleSubmit = () => {
    onStartGame(
      p1Name.trim() || 'Player 1',
      gameMode === 'ai' ? 'AI Player' : p2Name.trim() || 'Player 2',
      gameMode
    );
  };

  return (
    <div className="flex flex-col items-center my-8 p-6 sm:p-8 bg-white shadow-2xl rounded-xl w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-700 mb-6 sm:mb-8 text-center">Enter Player Names</h2>

      <div className="mb-6 w-full">
        <h3 className="text-lg font-medium text-gray-700 mb-2 text-center">Choose Game Mode</h3>
        <div className="flex justify-center gap-x-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="gameMode"
              value="ai"
              checked={gameMode === 'ai'}
              onChange={() => setGameMode('ai')}
              className="form-radio h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
            />
            <span className="text-gray-700">Player vs. AI</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="gameMode"
              value="human"
              checked={gameMode === 'human'}
              onChange={() => setGameMode('human')}
              className="form-radio h-5 w-5 text-pink-600 transition duration-150 ease-in-out"
            />
            <span className="text-gray-700">Player vs. Player</span>
          </label>
        </div>
      </div>

      <div className="mb-5 w-full">
        <label htmlFor="player1" className="block text-sm font-medium text-gray-600 mb-1">Player 1 (X)</label>
        <input
          type="text"
          id="player1"
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
          value={p1Name}
          onChange={(e) => setP1Name(e.target.value)}
          placeholder="Enter Player 1 Name"
        />
      </div>
      <div className="mb-8 w-full">
        <label htmlFor="player2" className="block text-sm font-medium text-gray-600 mb-1">Player 2 (O)</label>
        <input
          type="text"
          id="player2"
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out shadow-sm disabled:bg-slate-100 disabled:text-slate-500"
          value={p2Name} // p2Name will be "AI Player" if gameMode is 'ai' due to useEffect
          onChange={(e) => {
            if (gameMode === 'human') {
              setP2Name(e.target.value);
            }
          }}
          placeholder="Enter Player 2 Name"
          disabled={gameMode === 'ai'}
        />
      </div>
      <button
        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform hover:scale-105"
        onClick={handleSubmit}
      >
        Start Game
      </button>
    </div>
  );
};

export default PlayerNameInput;
