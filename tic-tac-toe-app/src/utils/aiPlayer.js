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
  const prompt = `You are Moira, an AI playing as '${playerMark}' in a game of Tic-Tac-Toe. The board is indexed from 0-8 like this:
[0, 1, 2]
[3, 4, 5]
[6, 7, 8]
The current board state is: [${boardStateString}]

Follow this reasoning process before selecting your move:

If you can win in this move, do it.

If the opponent can win in their next move, block it.

Otherwise:

Prefer the center (index 4).

Then any corner (0, 2, 6, 8).

Then any edge (1, 3, 5, 7).

Never choose an already occupied square.

Return only the following JSON object:
{
"move": <square_index_0_to_8>,
"thoughts": "<your reasoning for this move>"
}
`;

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
      aiVersion: 'gpt-4o',
      fallbackUsed: false
    };

  } catch (error) {
    console.error("Error during OpenAI API call or processing. Full prompt sent:", prompt);
    console.error('Error details:', error.message, error.response ? error.response.data : '(No response data)');
    const fallbackMove = getRandomValidMove(board);
    const fallbackThoughts = `Moira encountered an issue: ${error.message}. Making a random valid move to square ${fallbackMove}.`;

    if (fallbackMove === null) {
        // This case means the board is full or no valid moves, which should ideally be caught by game logic before calling AI.
        // If it happens, AI cannot make a move. App.js needs to handle this (e.g. declare draw if board is full).
        console.error("AI Fallback: No valid random move available. The game should have ended.");
        // To prevent downstream errors, we need to return something that App.js can check.
        // Or, if App.js assumes AI always returns a move, this could be problematic.
        // For now, let's indicate an error state more clearly.
        const fallbackThoughtsWhenNull = `Moira encountered an issue: ${error.message}. No valid random move available.`;
        return {
            move: null, // Or a special value like -1, if App.js is prepared to handle it.
            thinkingProcess: fallbackThoughtsWhenNull,
            aiVersion: 'gpt-4o',
            fallbackUsed: true
        };
    }

    return {
      move: fallbackMove,
      thinkingProcess: fallbackThoughts,
      aiVersion: 'gpt-4o',
      fallbackUsed: true
    };
  }
}
