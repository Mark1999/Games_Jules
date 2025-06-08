import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

// Helper function to find a random valid move
function getRandomValidMove(board) {
  const emptySquares = [];
  board.forEach((cell, index) => {
    if (cell === null || cell === '') { // Check for both null and empty string for an empty cell
      emptySquares.push(index);
    }
  });
  if (emptySquares.length === 0) {
    // This should ideally not happen if the game correctly identifies win/draw conditions before calling AI.
    // However, as a safeguard, return null or throw an error.
    // For Tic-Tac-Toe, if no empty squares, it's a draw or win, AI shouldn't be called.
    console.error("getRandomValidMove called on a full board or board with no valid moves.");
    return null;
  }
  return emptySquares[Math.floor(Math.random() * emptySquares.length)];
}

export async function calculateAIMove(board, playerMark = 'O') {
  const boardStateString = board.map(cell => (cell === null || cell === '') ? '_' : cell).join(', ');
  const prompt = `You are Moira, an AI playing as '${playerMark}' in tic-tac-toe. The current board is [${boardStateString}]. Think aloud about your next move. Then respond ONLY with JSON in the following format:
{
  "move": <square_index_0_to_8>,
  "thoughts": "<your_reasoning_for_the_move>"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      console.error('OpenAI API returned empty content.');
      throw new Error('OpenAI API returned empty content.'); // Trigger fallback
    }

    const parsedResponse = JSON.parse(responseContent);

    if (typeof parsedResponse.move !== 'number' || parsedResponse.move < 0 || parsedResponse.move > 8) {
      console.error('Invalid move format from API:', parsedResponse);
      throw new Error('Invalid move format from API.'); // Trigger fallback
    }
    if (typeof parsedResponse.thoughts !== 'string') {
      // If thoughts are missing, we can still proceed with the move but log a warning.
      // Or, strict mode: throw new Error('Invalid thoughts format from API.');
      console.warn('Thoughts missing or not a string from API. Proceeding with move if valid.');
      parsedResponse.thoughts = "AI analysis was not provided in the expected format."; // Provide a default thought
    }

    // Validate that the AI's chosen square is actually empty
    if (board[parsedResponse.move] !== null && board[parsedResponse.move] !== '') {
      console.error(`AI proposed an invalid move to an already taken square: ${parsedResponse.move}. Board: [${boardStateString}]`);
      throw new Error(`AI proposed move to already taken square ${parsedResponse.move}.`); // Trigger fallback
    }

    return {
      move: parsedResponse.move,
      thinkingProcess: parsedResponse.thoughts,
    };

  } catch (error) {
    console.error('Error calling OpenAI API, parsing response, or invalid move proposed:', error.message);
    const fallbackMove = getRandomValidMove(board);
    const fallbackThoughts = `Moira encountered an issue: ${error.message}. Making a random valid move to square ${fallbackMove}.`;

    if (fallbackMove === null) {
        // This case means the board is full or no valid moves, which should ideally be caught by game logic before calling AI.
        // If it happens, AI cannot make a move. App.js needs to handle this (e.g. declare draw if board is full).
        console.error("AI Fallback: No valid random move available. The game should have ended.");
        // To prevent downstream errors, we need to return something that App.js can check.
        // Or, if App.js assumes AI always returns a move, this could be problematic.
        // For now, let's indicate an error state more clearly.
        return {
            move: null, // Or a special value like -1, if App.js is prepared to handle it.
            thinkingProcess: "Moira encountered an issue and no fallback moves are available. The game might be in an inconsistent state.",
            error: true // Add an error flag
        };
    }

    return {
      move: fallbackMove,
      thinkingProcess: fallbackThoughts,
    };
  }
}
