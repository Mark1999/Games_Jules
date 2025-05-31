import React, { useState } from 'react';

const PlayerNameInput = ({ onStartGame }) => {
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');

  const handleSubmit = () => {
    // Pass default names if inputs are empty, or use the entered names.
    onStartGame(p1Name.trim() || 'Player 1', p2Name.trim() || 'Player 2');
  };

  return (
    <div className="flex flex-col items-center my-8 p-6 sm:p-8 bg-white shadow-2xl rounded-xl w-full max-w-md">
      <h2 className="text-3xl font-bold text-gray-700 mb-6 sm:mb-8 text-center">Enter Player Names</h2>
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
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out shadow-sm"
          value={p2Name}
          onChange={(e) => setP2Name(e.target.value)}
          placeholder="Enter Player 2 Name"
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
