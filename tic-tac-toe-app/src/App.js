import React, { useState } from 'react';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import PlayerNameInput from './components/PlayerNameInput';
import LogPane from './components/LogPane';
import { createLogEntry } from './utils/logger';
import { calculateAIMove } from './utils/aiPlayer'; // Added for AI
import './App.css';
import { calculateWinner } from './utils/gameLogic';

// Helper function for download
const downloadFile = ({ data, fileName, fileType }) => {
  const blob = new Blob([data], { type: fileType });
  const a = document.createElement('a');
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
  // Revoke the object URL to free up resources
  window.URL.revokeObjectURL(a.href);
};


function App() {
  console.log("Welcome to Tic-Tac-Toe!");
  const [player1Name, setPlayer1Name] = useState(''); // Default names can be set here if desired e.g. 'Player 1'
  const [player2Name, setPlayer2Name] = useState(''); // e.g. 'Player 2'
  const [isAiModeActive, setIsAiModeActive] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // X starts
  const [winnerInfo, setWinnerInfo] = useState(null); // Stores { winner: 'X'/'O', line: [...] }
  const [isDraw, setIsDraw] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameStatus, setGameStatus] = useState('pending'); // 'pending', 'playing', 'winner', 'draw'
  const [gameLogs, setGameLogs] = useState([]); // Stores all log entries

  const logEvent = (event, details) => {
    const newLog = createLogEntry(event, details);
    setGameLogs(prevLogs => [newLog, ...prevLogs]);
  };

  const handleStartGame = (p1, p2) => {
    const p1FinalName = p1 || "Player 1 ('X')";
    let p2FinalName = p2 || "Player 2 ('O')";

    if (isAiModeActive) {
      p2FinalName = "AI Player ('O')";
    }

    setPlayer1Name(p1FinalName);
    setPlayer2Name(p2FinalName);
    setGameStarted(true);
    setBoard(Array(9).fill(null)); // Reset board
    setXIsNext(true); // X always starts (or alternate turns)
    setWinnerInfo(null); // Reset winner
    setIsDraw(false); // Reset draw
    setGameStatus('playing'); // Set game status
    // setGameLogs([]); // Optional: Clear logs from previous game. For now, appending.
    logEvent('PLAYER_JOIN', { playerName: p1FinalName, mark: 'X' });
    if (isAiModeActive) {
      logEvent('PLAYER_JOIN', { playerName: p2FinalName, mark: 'O', isAI: true });
    } else {
      logEvent('PLAYER_JOIN', { playerName: p2FinalName, mark: 'O' });
    }
    logEvent('GAME_START', { player1Name: p1FinalName, player2Name: p2FinalName, aiMode: isAiModeActive });
  };

  // New function to handle AI's move
  const handleAIMove = async (currentBoard) => { // Make the function async
    // AI is 'O'
    // The calculateAIMove function now returns an object like:
    // { move: number | null, thinkingProcess: string, error?: boolean }
    const aiResponse = await calculateAIMove(currentBoard, 'O'); // Await the async call

    logEvent('AI_THINKING', { boardState: currentBoard, thoughts: aiResponse.thinkingProcess });

    // Check if AI returned an error or could not make a move
    if (aiResponse.error || aiResponse.move === null) {
      console.error("AI could not make a move or encountered an unrecoverable error.", aiResponse);
      // Potentially set an error state in the UI or simply don't proceed with a board update.
      // For now, we'll ensure AI thinking stops and turn might implicitly pass back or game state handles it.
      // If aiResponse.move is null, it means board might be full or in a state AI can't play.
      // The game's win/draw condition checks should ideally prevent this.
      // If it's an error, the fallback thoughts are already logged.
      setIsAiThinking(false); // Ensure AI thinking flag is reset

      // If no move was made, we might need to check for draw again, or it's human's turn if not a draw.
      // This part depends on how strictly game flow should be managed here.
      // For now, if AI makes no move, it effectively means no board change, and it will be human's turn again
      // unless a win/draw was declared before AI's turn.
      // However, the game logic should check for win/draw *after* human's move, *before* AI's turn.
      // If AI turn is reached and AI can't move (e.g. board full), it implies a draw if not a win.
      // Let's re-evaluate board status if AI move is null.
      if (aiResponse.move === null) {
          const calculatedWinnerInfo = calculateWinner(currentBoard); // Re-check on current board
          if (!calculatedWinnerInfo && currentBoard.every(square => square !== null)) {
              setIsDraw(true);
              setGameStatus('draw');
              logEvent('GAME_DRAW', { boardState: currentBoard, reason: "Board full after AI attempted move and found no valid plays." });
          } else if (!calculatedWinnerInfo) {
              // No winner, not a draw (e.g. AI error but board not full), switch back to human
              setXIsNext(true);
               logEvent('TURN_SWITCH', { nextPlayerName: player1Name, nextPlayerMark: 'X', reason: "AI failed to make a move." });
          }
          // If there was a winner, it should have been caught before AI's turn or after human's move.
      }
      return; // Stop further processing for AI move
    }

    const { move } = aiResponse; // move is guaranteed to be a number here if no error/null

    const newBoard = currentBoard.slice();
    newBoard[move] = 'O'; // AI is 'O'
    setBoard(newBoard);
    // The thinkingProcess from aiResponse was already logged above.
    logEvent('PLAYER_MOVE', { playerName: player2Name, mark: 'O', squareIndex: move, boardAfterMove: newBoard.slice(), isAI: true });

    const calculatedWinnerInfo = calculateWinner(newBoard);
    if (calculatedWinnerInfo) {
      setWinnerInfo(calculatedWinnerInfo);
      setGameStatus('winner');
      logEvent('WINNER_DECLARED', {
        winnerName: player2Name, // AI is 'O', thus player2Name
        winnerMark: 'O',
        winningLine: calculatedWinnerInfo.line,
        boardState: newBoard.slice(),
      });
    } else if (newBoard.every(square => square !== null)) {
      setIsDraw(true);
      setGameStatus('draw');
      logEvent('GAME_DRAW', { boardState: newBoard.slice() });
    } else {
      setXIsNext(true); // Switch turn back to Human (X)
      logEvent('TURN_SWITCH', { nextPlayerName: player1Name, nextPlayerMark: 'X' });
    }
    setIsAiThinking(false); // Reset AI thinking flag
  };


  const handleClick = (i) => {
    // Prevent human click if it's not their turn (especially in AI mode)
    if (isAiModeActive && !xIsNext) {
        logEvent('INVALID_MOVE', {
            player: player1Name, // Human player trying to click
            mark: 'X',
            squareIndex: i,
            reason: "Not player's turn (AI is thinking or has moved).",
            currentBoardState: board,
        });
        return;
    }

    if (winnerInfo || board[i] || gameStatus !== 'playing') {
      logEvent('INVALID_MOVE', {
        player: xIsNext ? player1Name : player2Name, // This will be player1Name due to the check above in AI mode
        mark: 'X', // Human is always 'X'
        squareIndex: i,
        reason: winnerInfo ? 'Game already won' : board[i] ? 'Square already taken' : 'Game not in playing state',
        currentBoardState: board,
      });
      return;
    }

    // Human's move (always 'X')
    const newBoard = board.slice();
    newBoard[i] = 'X'; // Human player is 'X'
    setBoard(newBoard);
    logEvent('PLAYER_MOVE', { playerName: player1Name, mark: 'X', squareIndex: i, boardAfterMove: newBoard.slice() });

    const calculatedWinnerInfo = calculateWinner(newBoard);
    if (calculatedWinnerInfo) {
      setWinnerInfo(calculatedWinnerInfo);
      setGameStatus('winner');
      logEvent('WINNER_DECLARED', {
        winnerName: player1Name, // Human made the winning move
        winnerMark: 'X',
        winningLine: calculatedWinnerInfo.line,
        boardState: newBoard.slice(),
      });
    } else if (newBoard.every(square => square !== null)) {
      setIsDraw(true);
      setGameStatus('draw');
      logEvent('GAME_DRAW', { boardState: newBoard.slice() });
    } else {
      // It's AI's turn if in AI mode
      if (isAiModeActive) {
        setXIsNext(false); // Set turn to AI ('O')
        logEvent('TURN_SWITCH', { nextPlayerName: player2Name, nextPlayerMark: 'O', isAI: true });
        setIsAiThinking(true);
        setTimeout(async () => { // The callback for setTimeout should be async
          await handleAIMove(newBoard); // Await the handleAIMove call
        }, 750); // 750ms delay, adjust as needed
      } else {
        // Regular two-player mode: switch to Player 2 ('O')
        setXIsNext(false);
        logEvent('TURN_SWITCH', { nextPlayerName: player2Name, nextPlayerMark: 'O' });
      }
    }
  };

  const handleRematch = () => {
    logEvent('GAME_REMATCH', { initiatedByPlayer: true, player1Name, player2Name, aiMode: isAiModeActive });
    setBoard(Array(9).fill(null));
    setXIsNext(true); // Reset to X starts or alternate
    setWinnerInfo(null);
    setIsDraw(false);
    setGameStatus('playing');
    setIsAiThinking(false); // Reset AI thinking state
    // Player names and AI mode remain the same for a rematch
  };

  const handleNewGame = () => {
    logEvent('GAME_NEW_SESSION', { initiatedByPlayer: true });
    setGameStarted(false);
    setPlayer1Name(''); // Clear player names
    setPlayer2Name('');
    // isAiModeActive will be reset by PlayerNameInput's default or user selection
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinnerInfo(null);
    setIsDraw(false);
    setGameStatus('pending'); // Set status to pending
    setIsAiThinking(false); // Reset AI thinking state
    // Optional: setGameLogs([]); // Decide if logs should be cleared here
  };

  const handleDownloadJson = () => {
    downloadFile({
      data: JSON.stringify(gameLogs, null, 2),
      fileName: `tic-tac-toe-logs-${new Date().toISOString()}.json`,
      fileType: 'application/json',
    });
    logEvent('LOG_DOWNLOAD', { format: 'JSON', logCount: gameLogs.length });
  };

  const handleDownloadTxt = () => {
    const textData = gameLogs
      .slice() // Create a copy before reversing for download
      .reverse() // To have logs in chronological order for text file
      .map(log => {
        const detailsString = Object.entries(log.details || {}).map(([key, value]) => {
          if (typeof value === 'object') return `${key}: ${JSON.stringify(value)}`;
          return `${key}: ${value}`;
        }).join(', ');
        return `${new Date(log.timestamp).toLocaleString()} - ${log.event}${detailsString ? `: ${detailsString}` : ''}`;
      })
      .join('\n');
    downloadFile({
      data: textData,
      fileName: `tic-tac-toe-logs-${new Date().toISOString()}.txt`,
      fileType: 'text/plain',
    });
    logEvent('LOG_DOWNLOAD', { format: 'TXT', logCount: gameLogs.length });
  };


  if (!gameStarted) {
    return <PlayerNameInput onStartGame={handleStartGame} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-5xl sm:text-6xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 py-2">
          Tic-Tac-Toe
        </h1>
      </header>

      <main className="flex flex-col lg:flex-row gap-6 items-start max-w-6xl w-full">
        <div className="flex-grow w-full lg:w-auto bg-white p-4 sm:p-6 rounded-xl shadow-2xl">
          <Board squares={board} onClick={handleClick} winningLine={winnerInfo?.line} />
          <GameInfo
            player1Name={player1Name}
            player2Name={player2Name}
            xIsNext={xIsNext}
            winner={winnerInfo?.winner}
            isDraw={isDraw}
            gameStatus={gameStatus}
            onRematch={handleRematch}
            onNewGame={handleNewGame}
            isAiModeActive={isAiModeActive} // Pass this new prop
            isAiThinking={isAiThinking}   // Pass this new prop
          />
        </div>
        <div className="flex-shrink-0 w-full lg:w-[30rem] bg-white p-3 sm:p-4 rounded-xl shadow-2xl">
          <LogPane logs={gameLogs} />
          {gameLogs.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={handleDownloadJson}
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
              >
                Download JSON
              </button>
              <button
                onClick={handleDownloadTxt}
                className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 transition duration-150 ease-in-out"
              >
                Download TXT
              </button>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-8 text-center">
        <p className="text-sm text-slate-500">Enhanced by AI Agent</p>
      </footer>
    </div>
  );
}

export default App;
