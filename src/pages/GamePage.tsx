import { useState, useEffect, useCallback } from 'react';
import SudokuBoard from '@/components/SudokuBoard';
import NumberPad from '@/components/NumberPad';
import GameHeader from '@/components/GameHeader';
import GameControls from '@/components/GameControls';
import DifficultySelect from '@/components/DifficultySelect';
import GameComplete from '@/components/GameComplete';
import { generatePuzzle, isBoardSolved, getHint } from '@/lib/sudoku';
import type { Board, CellValue, Difficulty, GameStatus } from '@/types/sudoku';

function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      notes: [...cell.notes],
    }))
  );
}

export default function GamePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [board, setBoard] = useState<Board>([]);
  const [solution, setSolution] = useState<CellValue[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [noteMode, setNoteMode] = useState(false);
  const [history, setHistory] = useState<Board[]>([]);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const maxMistakes = 3;

  const startNewGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setBoard(puzzle);
    setSolution(sol);
    setDifficulty(diff);
    setSelectedCell(null);
    setMistakes(0);
    setTimer(0);
    setStatus('playing');
    setNoteMode(false);
    setHistory([]);
    setShowDifficultyDialog(false);
  }, []);

  useEffect(() => {
    startNewGame('medium');
  }, [startNewGame]);

  useEffect(() => {
    if (status !== 'playing') return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (board.length === 0 || status !== 'playing') return;
    if (isBoardSolved(board, solution)) {
      setStatus('won');
    }
  }, [board, solution, status]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell([row, col]);
  }, []);

  const handleNumber = useCallback(
    (num: number) => {
      if (!selectedCell || status !== 'playing') return;
      const [r, c] = selectedCell;
      const cell = board[r][c];
      if (cell.isGiven) return;

      setHistory((h) => [...h, cloneBoard(board)]);
      const newBoard = cloneBoard(board);
      const target = newBoard[r][c];

      if (noteMode) {
        if (target.value) return;
        const idx = target.notes.indexOf(num);
        if (idx >= 0) {
          target.notes.splice(idx, 1);
        } else {
          target.notes.push(num);
          target.notes.sort();
        }
      } else {
        target.notes = [];
        target.value = num as CellValue;
        if (num !== solution[r][c]) {
          target.isError = true;
          setMistakes((m) => {
            const next = m + 1;
            if (next >= maxMistakes) {
              setStatus('paused');
            }
            return next;
          });
        } else {
          target.isError = false;
          for (let i = 0; i < 9; i++) {
            newBoard[r][i].notes = newBoard[r][i].notes.filter((n) => n !== num);
            newBoard[i][c].notes = newBoard[i][c].notes.filter((n) => n !== num);
          }
          const br = Math.floor(r / 3) * 3;
          const bc = Math.floor(c / 3) * 3;
          for (let rr = br; rr < br + 3; rr++) {
            for (let cc = bc; cc < bc + 3; cc++) {
              newBoard[rr][cc].notes = newBoard[rr][cc].notes.filter((n) => n !== num);
            }
          }
        }
      }

      setBoard(newBoard);
    },
    [selectedCell, board, solution, noteMode, status]
  );

  const handleErase = useCallback(() => {
    if (!selectedCell || status !== 'playing') return;
    const [r, c] = selectedCell;
    const cell = board[r][c];
    if (cell.isGiven) return;
    if (!cell.value && cell.notes.length === 0) return;

    setHistory((h) => [...h, cloneBoard(board)]);
    const newBoard = cloneBoard(board);
    newBoard[r][c].value = null;
    newBoard[r][c].isError = false;
    newBoard[r][c].notes = [];
    setBoard(newBoard);
  }, [selectedCell, board, status]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory((h) => h.slice(0, -1));
  }, [history]);

  const handleHint = useCallback(() => {
    if (status !== 'playing') return;

    const hintPos = selectedCell
      && !board[selectedCell[0]][selectedCell[1]].isGiven
      && (!board[selectedCell[0]][selectedCell[1]].value || board[selectedCell[0]][selectedCell[1]].isError)
      ? selectedCell
      : getHint(board, solution);

    if (!hintPos) return;
    const [hr, hc] = hintPos;

    setHistory((h) => [...h, cloneBoard(board)]);
    const newBoard = cloneBoard(board);
    newBoard[hr][hc].value = solution[hr][hc];
    newBoard[hr][hc].isError = false;
    newBoard[hr][hc].notes = [];
    newBoard[hr][hc].isGiven = true;
    setBoard(newBoard);
    setSelectedCell([hr, hc]);
  }, [selectedCell, board, solution, status]);

  const handlePauseResume = useCallback(() => {
    setStatus((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (status !== 'playing') return;

      if (e.key >= '1' && e.key <= '9') {
        handleNumber(parseInt(e.key));
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        setNoteMode((n) => !n);
        return;
      }

      if (!selectedCell) return;

      const moves: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };

      const move = moves[e.key];
      if (move) {
        e.preventDefault();
        const newRow = Math.max(0, Math.min(8, selectedCell[0] + move[0]));
        const newCol = Math.max(0, Math.min(8, selectedCell[1] + move[1]));
        setSelectedCell([newRow, newCol]);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedCell, status, handleNumber, handleErase]);

  if (board.length === 0) return null;

  return (
    <div className="game-page">
      <div className="game-container">
        <GameHeader
          time={timer}
          mistakes={mistakes}
          maxMistakes={maxMistakes}
          difficulty={difficulty}
          status={status}
          onPauseResume={handlePauseResume}
          onNewGame={() => setShowDifficultyDialog(true)}
        />
        <SudokuBoard
          board={board}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
        />
        <GameControls
          notesMode={noteMode}
          onUndo={handleUndo}
          onNotesToggle={() => setNoteMode((n) => !n)}
          onHint={handleHint}
        />
        <NumberPad
          board={board}
          noteMode={noteMode}
          onNumber={handleNumber}
          onErase={handleErase}
          onNotesToggle={() => setNoteMode((n) => !n)}
        />
      </div>

      <DifficultySelect
        open={showDifficultyDialog}
        onSelect={startNewGame}
        onClose={() => setShowDifficultyDialog(false)}
      />

      <GameComplete
        open={status === 'won'}
        time={timer}
        mistakes={mistakes}
        difficulty={difficulty}
        onPlayAgain={() => setShowDifficultyDialog(true)}
      />
    </div>
  );
}
