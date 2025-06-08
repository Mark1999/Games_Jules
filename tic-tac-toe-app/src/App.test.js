import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App Component - Core Game Flow', () => {
  test('renders PlayerNameInput screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Enter Player Names/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Player 1 Name/i)).toBeInTheDocument();
    // Player 2 input is initially enabled before mode selection might disable it
    expect(screen.getByPlaceholderText(/Enter Player 2 Name/i)).toBeInTheDocument();
  });

  test('starts a "Player vs. AI" game and renders the board', () => {
    render(<App />);
    // Select "Player vs. AI" mode (should be default, but let's be explicit if possible or test default)
    // For this basic test, we'll assume AI mode is default or rely on PlayerNameInput's default behavior.
    // PlayerNameInput.js sets gameMode to 'ai' by default.

    fireEvent.click(screen.getByText(/Player vs. AI/i)); // Ensure AI mode is selected

    userEvent.type(screen.getByPlaceholderText(/Enter Player 1 Name/i), 'Human Player');
    // Player 2 name input should be disabled and set to "AI Player"
    expect(screen.getByPlaceholderText(/Enter Player 2 Name/i)).toBeDisabled();
    expect(screen.getByDisplayValue(/AI Player/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    expect(screen.getByText(/Tic-Tac-Toe/i)).toBeInTheDocument(); // Main game header
    expect(screen.getByText(/Current Player: Human Player \(X\)/i)).toBeInTheDocument();
    // Check for the presence of the board (e.g., by checking for squares)
    const squares = screen.getAllByRole('button', { name: /Square/i });
    expect(squares.length).toBe(9);
  });

  test('starts a "Player vs. Player" game and renders the board', () => {
    render(<App />);

    // Select "Player vs. Player" mode
    fireEvent.click(screen.getByText(/Player vs. Player/i));

    userEvent.type(screen.getByPlaceholderText(/Enter Player 1 Name/i), 'Alice');
    const player2Input = screen.getByPlaceholderText(/Enter Player 2 Name/i);
    expect(player2Input).toBeEnabled();
    userEvent.type(player2Input, 'Bob');

    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    expect(screen.getByText(/Tic-Tac-Toe/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Player: Alice \(X\)/i)).toBeInTheDocument();
    const squares = screen.getAllByRole('button', { name: /Square/i });
    expect(squares.length).toBe(9);
  });

  test('allows Player X to make a move, board updates, and turn switches in AI mode', async () => {
    render(<App />);
    userEvent.setup(); // Preferred way to setup userEvent for v14+

    // Start AI game
    fireEvent.click(screen.getByText(/Player vs. AI/i)); // Ensure AI mode
    userEvent.type(screen.getByPlaceholderText(/Enter Player 1 Name/i), 'Player X');
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    // Initial state: Player X's turn
    expect(screen.getByText(/Current Player: Player X \(X\)/i)).toBeInTheDocument();

    const squares = screen.getAllByRole('button', { name: /Square/i });
    // Player X clicks the first square (index 0)
    // Need to use userEvent.click for async updates and proper event handling
    await userEvent.click(squares[0]);

    // Check if the square is updated with 'X'
    expect(squares[0]).toHaveTextContent('X');

    // Check if turn switched to AI Player (O)
    // AI move might be very fast. We need to wait for the state to update.
    // The status text will briefly show AI's turn, then AI moves, then back to Player X.
    // For this basic test, we'll check that Player X's turn is active again after AI moves.
    // A more robust test would involve waiting for "AI is thinking" or AI's move.
    // Since AI move is async and quick, we expect it to become Player X's turn again.
    // Wait for "Current Player: Player X (X)" to reappear after AI's potential move.
    // AI makes a move, then it's X's turn again.
    // We need to ensure the AI has made a move. One square should be 'O'.
    // This part of the test can be flaky if AI's move is not immediate or if its logic changes.
    // For a *basic* test, we'll just check X made a move. More complex AI interaction later.

    // Simpler check for this basic test: after X moves, it's O's turn (AI)
    // We will see "Current Player: AI Player (O)" briefly if AI hasn't moved yet,
    // or "Current Player: Player X (X)" if AI moved super fast.
    // The AI moves and then it becomes X's turn again.
    // Let's look for AI's mark on the board.
    // This requires the AI to make a predictable move or to search for 'O'.
    // As AI's move is not part of this immediate click's synchronous flow,
    // we'll check that it's no longer X's turn according to the GameInfo text,
    // implying it's O's (AI's) turn or AI has already moved and it's X's turn again.

    // After X's move, it becomes O's (AI's) turn. AI will then move.
    // We expect the game to show it's AI's turn, then AI moves, then it's X's turn.
    // For simplicity, we'll verify X's move. A full AI interaction test is more complex.
    // The GameInfo will display "Current Player: AI Player (O)" if the AI move is delayed or being processed.
    // If the AI move is instant, it will switch to "Current Player: Player X (X)" again.

    // Let's check that an 'O' appears on the board (AI's move)
    // This requires awaiting the AI's move.
    // We expect the AI to make a move.
    await screen.findByText((content, element) => element.tagName.toLowerCase() === 'button' && content === 'O');
    expect(screen.getByText(/Current Player: Player X \(X\)/i)).toBeInTheDocument(); // Back to Player X
  });

  test('allows Player X and Player O to make moves in Player vs. Player mode', async () => {
    render(<App />);
    userEvent.setup();

    // Start Player vs. Player game
    fireEvent.click(screen.getByText(/Player vs. Player/i));
    userEvent.type(screen.getByPlaceholderText(/Enter Player 1 Name/i), 'Human X');
    userEvent.type(screen.getByPlaceholderText(/Enter Player 2 Name/i), 'Human O');
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    const squares = screen.getAllByRole('button', { name: /Square/i });

    // Player X's turn
    expect(screen.getByText(/Current Player: Human X \(X\)/i)).toBeInTheDocument();
    await userEvent.click(squares[0]);
    expect(squares[0]).toHaveTextContent('X');

    // Player O's turn
    expect(screen.getByText(/Current Player: Human O \(O\)/i)).toBeInTheDocument();
    await userEvent.click(squares[1]);
    expect(squares[1]).toHaveTextContent('O');

    // Back to Player X's turn
    expect(screen.getByText(/Current Player: Human X \(X\)/i)).toBeInTheDocument();
  });
});
