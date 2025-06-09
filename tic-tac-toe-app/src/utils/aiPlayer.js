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
  const prompt = `You are Moira, an expert AI playing as '${playerMark}' in a game of Tic-Tac-Toe. Your goal is to win.
The board is indexed from 0-8 like this:
[0, 1, 2]
[3, 4, 5]
[6, 7, 8]

The current board state is: [${boardStateString}]

Follow this precise reasoning process. Consider these rules in order of importance:
1.  **Win**: If you have an immediate winning move (two of your marks in a line with one empty square), take that winning square.
2.  **Block Opponent's Win**: Critical: If the opponent has an immediate winning move (two of their marks in a line with one empty square), you MUST block it by playing in that empty square. Check all rows, columns, and diagonals for the opponent's pending wins.
3.  **Create Fork**: If neither you nor the opponent can win immediately, check if you can create a fork – a situation where you place your mark to create two potential winning lines simultaneously. If multiple fork opportunities exist, choose one.
4.  **Block Opponent's Fork**: If you cannot create a fork, and the opponent is about to create a fork on their next move, you should try to block their fork. This is more complex: identify if the opponent can make a move that creates two winning threats for them. Play to prevent such a scenario. (e.g., if opponent has X's at 0 and 8, and you play at 4 (center), they might try to create a fork at 2 or 6. You might need to take a defensive position). *Consider this step carefully.*
5.  **Strategic Placement**: If no immediate win, block, fork, or fork-block is apparent:
    a.  **Center**: Take the center square (4) if it is available.
    b.  **Opposite Corner**: If the opponent has taken a corner, and the center is taken by you, take the corner opposite to the opponent's.
    c.  **Empty Corner**: Otherwise, take any available corner square (0, 2, 6, 8).
    d.  **Empty Side**: As a last resort, take any available side/edge square (1, 3, 5, 7).

6.  **Valid Moves Only**: Never choose an occupied square. Ensure your chosen move index is an empty square on the current board.

Return only JSON:
{
  "move": <index from 0-8>,
  "thoughts": "<Explain your reasoning step-by-step based on the rules above. State which rule number led to your decision. If you are blocking or winning, specify the line (e.g., 'Blocking opponent's win on row 0-1-2 by playing at 2').>"
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
