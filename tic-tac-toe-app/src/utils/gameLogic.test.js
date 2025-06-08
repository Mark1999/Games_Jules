import { calculateWinner } from './gameLogic';

describe('calculateWinner', () => {
  test('should return null for an empty board', () => {
    const squares = Array(9).fill(null);
    expect(calculateWinner(squares)).toBeNull();
  });

  test('should return null when no winner and game in progress', () => {
    const squares = ['X', 'O', 'X', null, 'O', null, 'X', null, null];
    expect(calculateWinner(squares)).toBeNull();
  });

  test('should return null for a draw game (full board, no winner)', () => {
    const squares = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(calculateWinner(squares)).toBeNull();
  });

  // Test winning rows
  test('should identify a winning row for X (top)', () => {
    const squares = ['X', 'X', 'X', 'O', null, 'O', null, null, null];
    expect(calculateWinner(squares)).toEqual({ winner: 'X', line: [0, 1, 2] });
  });
  test('should identify a winning row for O (middle)', () => {
    const squares = ['X', null, 'X', 'O', 'O', 'O', null, 'X', null];
    expect(calculateWinner(squares)).toEqual({ winner: 'O', line: [3, 4, 5] });
  });
  test('should identify a winning row for X (bottom)', () => {
    const squares = [null, 'O', null, 'O', 'O', null, 'X', 'X', 'X'];
    expect(calculateWinner(squares)).toEqual({ winner: 'X', line: [6, 7, 8] });
  });

  // Test winning columns
  test('should identify a winning column for X (left)', () => {
    const squares = ['X', 'O', null, 'X', 'O', null, 'X', null, null];
    expect(calculateWinner(squares)).toEqual({ winner: 'X', line: [0, 3, 6] });
  });
  test('should identify a winning column for O (middle)', () => {
    const squares = ['X', 'O', null, null, 'O', 'X', 'X', 'O', null];
    expect(calculateWinner(squares)).toEqual({ winner: 'O', line: [1, 4, 7] });
  });
  test('should identify a winning column for X (right)', () => {
    const squares = [null, 'O', 'X', null, 'O', 'X', null, null, 'X'];
    expect(calculateWinner(squares)).toEqual({ winner: 'X', line: [2, 5, 8] });
  });

  // Test winning diagonals
  test('should identify a winning diagonal for X (top-left to bottom-right)', () => {
    const squares = ['X', 'O', null, 'O', 'X', null, null, 'O', 'X'];
    expect(calculateWinner(squares)).toEqual({ winner: 'X', line: [0, 4, 8] });
  });
  test('should identify a winning diagonal for O (top-right to bottom-left)', () => {
    const squares = [null, 'X', 'O', 'X', 'O', null, 'O', 'X', null];
    expect(calculateWinner(squares)).toEqual({ winner: 'O', line: [2, 4, 6] });
  });

  test('should only declare winner if three consecutive marks', () => {
    const squares = ['X', 'X', null, 'O', 'O', null, 'X', 'O', 'X'];
    expect(calculateWinner(squares)).toBeNull();
  });
});
