import { useState, useEffect, useCallback } from 'react';
import SudokuBoard from '../components/SudokuBoard';
import NumberPad from '../components/NumberPad';
import GameHeader from '../components/GameHeader';
import GameControls from '../components/GameControls';
import DifficultySelect from '../components/DifficultySelect';
import GameComplete from '../components/GameComplete';
import type { Cell, Position, Difficulty } from '../types/game';

// --- Sudoku Generator ---

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function solveSudoku(grid: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const n of nums) {
          if (isValid(grid, r, c, n)) {
            grid[r][c] = n;
            if (solveSudoku(grid)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generatePuzzle(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(grid);
  const solution = grid.map((r) => [...r]);

  const removeCounts: Record<Difficulty, number> = {
    easy: 36,
    medium: 45,
    hard: 52,
    expert: 58,
  };

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= removeCounts[difficulty]) break;
    grid[r][c] = 0;
    removed++;
  }

  return { puzzle: grid, solution };
}

function createBoard(puzzle: number[][]): Cell[][] {
  return puzzle.map((row) =>
    row.map((val) => ({
      value: val || null,
      given: val !== 0,
      notes: new Set<number>(),
      error: false,
    }))
  );
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      notes: new Set(cell.notes),
    }))
  );
}

// --- Component ---

export default function GamePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selected, setSelected] = useState<Position | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState<Cell[][][]>([]);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const maxMistakes = 3;

  const startNewGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setBoard(createBoard(puzzle));
    setSolution(sol);
    setDifficulty(diff);
    setSelected(null);
    setMistakes(0);
    setTime(0);
    setIsRunning(true);
    setIsComplete(false);
    setNotesMode(false);
    setHistory([]);
    setShowDifficultyDialog(false);
  }, []);

  // Start initial game
  useEffect(() => {
    startNewGame('medium');
  }, [startNewGame]);

  // Timer
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  // Check completion
  useEffect(() => {
    if (board.length === 0) return;
    const complete = board.every((row) =>
      row.every((cell) => cell.value !== null && !cell.error)
    );
    if (complete) {
      setIsComplete(true);
      setIsRunning(false);
    }
  }, [board]);

  const handleCellClick = useCallback((pos: Position) => {
    setSelected(pos);
  }, []);

  const handleNumber = useCallback(
    (num: number) => {
      if (!selected || isComplete) return;
      const cell = board[selected.row][selected.col];
      if (cell.given) return;

      setHistory((h) => [...h, cloneBoard(board)]);
      const newBoard = cloneBoard(board);
      const target = newBoard[selected.row][selected.col];

      if (notesMode) {
        if (target.value) return;
        if (target.notes.has(num)) {
          target.notes.delete(num);
        } else {
          target.notes.add(num);
        }
      } else {
        target.notes = new Set();
        target.value = num;
        if (num !== solution[selected.row][selected.col]) {
          target.error = true;
          setMistakes((m) => {
            const next = m + 1;
            if (next >= maxMistakes) {
              setIsRunning(false);
            }
            return next;
          });
        } else {
          target.error = false;
          // Remove this number from notes in same row/col/box
          for (let i = 0; i < 9; i++) {
            newBoard[selected.row][i].notes.delete(num);
            newBoard[i][selected.col].notes.delete(num);
          }
          const br = Math.floor(selected.row / 3) * 3;
          const bc = Math.floor(selected.col / 3) * 3;
          for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
              newBoard[r][c].notes.delete(num);
            }
          }
        }
      }

      setBoard(newBoard);
    },
    [selected, board, solution, notesMode, isComplete]
  );

  const handleErase = useCallback(() => {
    if (!selected || isComplete) return;
    const cell = board[selected.row][selected.col];
    if (cell.given) return;
    if (!cell.value && cell.notes.size === 0) return;

    setHistory((h) => [...h, cloneBoard(board)]);
    const newBoard = cloneBoard(board);
    newBoard[selected.row][selected.col].value = null;
    newBoard[selected.row][selected.col].error = false;
    newBoard[selected.row][selected.col].notes = new Set();
    setBoard(newBoard);
  }, [selected, board, isComplete]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const handleHint = useCallback(() => {
    if (!selected || isComplete) return;
    const cell = board[selected.row][selected.col];
    if (cell.given || (cell.value && !cell.error)) return;

    setHistory((h) => [...h, cloneBoard(board)]);
    const newBoard = cloneBoard(board);
    const target = newBoard[selected.row][selected.col];
    target.value = solution[selected.row][selected.col];
    target.error = false;
    target.notes = new Set();
    target.given = true;
    setBoard(newBoard);
  }, [selected, board, solution, isComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isRunning) return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumber(parseInt(e.key));
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
        return;
      }

      if (!selected) return;

      const moves: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };

      const move = moves[e.key];
      if (move) {
        e.preventDefault();
        const newRow = Math.max(0, Math.min(8, selected.row + move[0]));
        const newCol = Math.max(0, Math.min(8, selected.col + move[1]));
        setSelected({ row: newRow, col: newCol });
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, isRunning, handleNumber, handleErase]);

  if (board.length === 0) return null;

  return (
    <div className="game-page">
      <div className="game-container">
        <GameHeader
          time={time}
          mistakes={mistakes}
          maxMistakes={maxMistakes}
          difficulty={difficulty}
          isRunning={isRunning}
          onPauseResume={() => setIsRunning((r) => !r)}
          onNewGame={() => setShowDifficultyDialog(true)}
        />
        <SudokuBoard
          board={board}
          selected={selected}
          onCellClick={handleCellClick}
        />
        <GameControls
          notesMode={notesMode}
          onUndo={handleUndo}
          onNotesToggle={() => setNotesMode((n) => !n)}
          onHint={handleHint}
        />
        <NumberPad
          board={board}
          notesMode={notesMode}
          onNumber={handleNumber}
          onErase={handleErase}
          onNotesToggle={() => setNotesMode((n) => !n)}
        />
      </div>

      <DifficultySelect
        open={showDifficultyDialog}
        onSelect={startNewGame}
        onClose={() => setShowDifficultyDialog(false)}
      />

      <GameComplete
        open={isComplete}
        time={time}
        mistakes={mistakes}
        difficulty={difficulty}
        onPlayAgain={() => setShowDifficultyDialog(true)}
      />
    </div>
  );
}
