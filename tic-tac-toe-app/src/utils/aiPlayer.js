// Helper function to calculate the winner (similar to App.js)
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

export const calculateAIMove = (currentBoard, aiMark) => {
  const opponentMark = aiMark === 'X' ? 'O' : 'X';
  const emptySquares = currentBoard
    .map((square, index) => (square === null ? index : null))
    .filter(index => index !== null);

  let thinkingProcess = {
    boardState: [...currentBoard],
    aiMark: aiMark,
    opponentMark: opponentMark,
    possibleMoves: [...emptySquares],
    winningMoveForAI: null,
    blockingMoveForOpponent: null,
    strategicOverride: null,
    chosenMove: null,
    reason: ""
  };

  // 1. Check for AI win
  for (const move of emptySquares) {
    const boardCopy = [...currentBoard];
    boardCopy[move] = aiMark;
    if (calculateWinner(boardCopy)?.winner === aiMark) {
      thinkingProcess.winningMoveForAI = move;
      thinkingProcess.chosenMove = move;
      thinkingProcess.reason = `AI takes winning move at index ${move}.`;
      return {
        move: move,
        thinkingProcess: thinkingProcess
      };
    }
  }

  // 2. Check for opponent block
  for (const move of emptySquares) {
    const boardCopy = [...currentBoard];
    boardCopy[move] = opponentMark;
    if (calculateWinner(boardCopy)?.winner === opponentMark) {
      thinkingProcess.blockingMoveForOpponent = move;
      thinkingProcess.chosenMove = move;
      thinkingProcess.reason = `AI blocks opponent's winning move at index ${move}.`;
      return {
        move: move,
        thinkingProcess: thinkingProcess
      };
    }
  }

  // 3. Strategic placement
  // 3.a. Try center
  const centerSquare = 4;
  if (emptySquares.includes(centerSquare)) {
    thinkingProcess.strategicOverride = { type: 'center', move: centerSquare };
    thinkingProcess.chosenMove = centerSquare;
    thinkingProcess.reason = "AI takes center square.";
    return {
      move: centerSquare,
      thinkingProcess: thinkingProcess
    };
  }

  // 3.b. Try corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(corner => emptySquares.includes(corner));
  if (availableCorners.length > 0) {
    const cornerMove = availableCorners[0]; // Pick the first available corner
    thinkingProcess.strategicOverride = { type: 'corner', move: cornerMove };
    thinkingProcess.chosenMove = cornerMove;
    thinkingProcess.reason = `AI takes corner square at index ${cornerMove}.`;
    return {
      move: cornerMove,
      thinkingProcess: thinkingProcess
    };
  }

  // 3.c. Try sides
  const sides = [1, 3, 5, 7];
  const availableSides = sides.filter(side => emptySquares.includes(side));
  if (availableSides.length > 0) {
    const sideMove = availableSides[0]; // Pick the first available side
    thinkingProcess.strategicOverride = { type: 'side', move: sideMove };
    thinkingProcess.chosenMove = sideMove;
    thinkingProcess.reason = `AI takes side square at index ${sideMove}.`;
    return {
      move: sideMove,
      thinkingProcess: thinkingProcess
    };
  }
  
  // Should not be reached if there are empty squares, but as a fallback:
  if (emptySquares.length > 0) {
      thinkingProcess.chosenMove = emptySquares[0];
      thinkingProcess.reason = `AI takes the first available square at index ${emptySquares[0]} as a fallback.`;
       return {
        move: emptySquares[0],
        thinkingProcess: thinkingProcess
      };
  }

  // No moves possible (board is full or error)
  thinkingProcess.reason = "No moves available for AI.";
  return {
    move: null, // Or some other indicator like -1 if preferred
    thinkingProcess: thinkingProcess
  };
};
