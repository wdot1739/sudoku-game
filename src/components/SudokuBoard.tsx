import { useCallback } from 'react';
import SudokuCell from './SudokuCell';
import type { Board } from '@/types/sudoku';

interface SudokuBoardProps {
  board: Board;
  selectedCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
}

export default function SudokuBoard({ board, selectedCell, onCellClick }: SudokuBoardProps) {
  const isHighlighted = useCallback(
    (row: number, col: number): boolean => {
      if (!selectedCell) return false;
      const [sr, sc] = selectedCell;
      if (row === sr && col === sc) return false;
      return (
        row === sr ||
        col === sc ||
        (Math.floor(row / 3) === Math.floor(sr / 3) &&
          Math.floor(col / 3) === Math.floor(sc / 3))
      );
    },
    [selectedCell]
  );

  const isSameValue = useCallback(
    (row: number, col: number): boolean => {
      if (!selectedCell) return false;
      const [sr, sc] = selectedCell;
      const selectedVal = board[sr][sc].value;
      if (!selectedVal) return false;
      if (row === sr && col === sc) return false;
      return board[row][col].value === selectedVal;
    },
    [selectedCell, board]
  );

  return (
    <div className="sudoku-board" role="grid">
      {board.map((row, r) =>
        row.map((cell, c) => (
          <SudokuCell
            key={`${r}-${c}`}
            cell={cell}
            row={r}
            col={c}
            isSelected={selectedCell?.[0] === r && selectedCell?.[1] === c}
            isHighlighted={isHighlighted(r, c)}
            isSameValue={isSameValue(r, c)}
            onClick={onCellClick}
          />
        ))
      )}
    </div>
  );
}
