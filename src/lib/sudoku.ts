import type { CellValue, Difficulty, Board, Cell } from '@/types/sudoku';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isValidPlacement(
  board: (CellValue | number)[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (r !== row && c !== col && board[r][c] === num) return false;
    }
  }
  return true;
}

export function generateSolution(): CellValue[][] {
  const board: CellValue[][] = Array.from({ length: 9 }, () =>
    Array(9).fill(null)
  );

  function solve(row: number, col: number): boolean {
    if (row === 9) return true;
    const nextRow = col === 8 ? row + 1 : row;
    const nextCol = col === 8 ? 0 : col + 1;

    if (board[row][col] !== null) {
      return solve(nextRow, nextCol);
    }

    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of nums) {
      if (isValidPlacement(board, row, col, num)) {
        board[row][col] = num as CellValue;
        if (solve(nextRow, nextCol)) return true;
        board[row][col] = null;
      }
    }
    return false;
  }

  solve(0, 0);
  return board;
}

const CELLS_TO_REMOVE: Record<Difficulty, number> = {
  easy: 35,
  medium: 45,
  hard: 52,
  expert: 58,
};

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Board;
  solution: CellValue[][];
} {
  const solution = generateSolution();
  const puzzleValues: CellValue[][] = solution.map((row) => [...row]);

  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  let removed = 0;
  const toRemove = CELLS_TO_REMOVE[difficulty];

  for (const [row, col] of positions) {
    if (removed >= toRemove) break;
    puzzleValues[row][col] = null;
    removed++;
  }

  const puzzle: Board = puzzleValues.map((row) =>
    row.map(
      (value): Cell => ({
        value,
        isGiven: value !== null,
        isSelected: false,
        isHighlighted: false,
        isError: false,
        notes: [],
      })
    )
  );

  return { puzzle, solution };
}

export function isBoardSolved(board: Board, solution: CellValue[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== solution[r][c]) return false;
    }
  }
  return true;
}

export function getHint(
  board: Board,
  _solution: CellValue[][]
): [number, number] | null {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value === null && !board[r][c].isGiven) {
        emptyCells.push([r, c]);
      }
    }
  }
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
