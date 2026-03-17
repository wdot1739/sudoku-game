import { motion } from 'framer-motion';
import type { Cell } from '@/types/sudoku';

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameValue: boolean;
  onClick: (row: number, col: number) => void;
}

export default function SudokuCell({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  isSameValue,
  onClick,
}: SudokuCellProps) {
  const classNames = ['sudoku-cell'];
  if (isSelected) classNames.push('selected');
  if (isHighlighted) classNames.push('highlighted');
  if (isSameValue) classNames.push('same-value');
  if (cell.isGiven) classNames.push('given');
  if (cell.isError) classNames.push('error');
  if (col % 3 === 0) classNames.push('box-left');
  if (row % 3 === 0) classNames.push('box-top');
  if (col === 8) classNames.push('box-right');
  if (row === 8) classNames.push('box-bottom');

  return (
    <motion.div
      className={classNames.join(' ')}
      onClick={() => onClick(row, col)}
      role="gridcell"
      aria-label={`Row ${row + 1}, Column ${col + 1}${cell.value ? `, value ${cell.value}` : ', empty'}`}
      animate={{
        backgroundColor: isSelected
          ? 'rgba(79, 70, 229, 0.35)'
          : cell.isError
            ? 'rgba(239, 68, 68, 0.15)'
            : isSameValue
              ? 'rgba(99, 102, 241, 0.15)'
              : isHighlighted
                ? 'rgba(99, 102, 241, 0.08)'
                : 'rgba(30, 41, 59, 1)',
      }}
      transition={{ duration: 0.15 }}
    >
      {cell.value ? (
        <motion.span
          className="cell-value"
          key={cell.value}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          {cell.value}
        </motion.span>
      ) : cell.notes.length > 0 ? (
        <div className="cell-notes">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span key={n} className={`note ${cell.notes.includes(n) ? 'visible' : ''}`}>
              {cell.notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
