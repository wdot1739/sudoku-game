import type { Board } from '@/types/sudoku';

interface NumberPadProps {
  board: Board;
  noteMode: boolean;
  onNumber: (n: number) => void;
  onErase: () => void;
  onNotesToggle: () => void;
}

export default function NumberPad({
  board,
  noteMode,
  onNumber,
  onErase,
  onNotesToggle,
}: NumberPadProps) {
  const getCounts = () => {
    const counts: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) counts[n] = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell.value) counts[cell.value]++;
      }
    }
    return counts;
  };

  const counts = getCounts();

  return (
    <div className="number-pad">
      <div className="number-buttons">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const remaining = 9 - counts[n];
          const exhausted = remaining <= 0;
          return (
            <button
              key={n}
              className={`num-btn ${exhausted ? 'exhausted' : ''}`}
              onClick={() => onNumber(n)}
              disabled={exhausted}
            >
              <span className="num-value">{n}</span>
              <span className="num-remaining">{remaining}</span>
            </button>
          );
        })}
      </div>
      <div className="pad-actions">
        <button className="action-btn" onClick={onErase}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
            <line x1="18" y1="9" x2="12" y2="15"/>
            <line x1="12" y1="9" x2="18" y2="15"/>
          </svg>
          Erase
        </button>
        <button
          className={`action-btn ${noteMode ? 'active' : ''}`}
          onClick={onNotesToggle}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Notes
        </button>
      </div>
    </div>
  );
}
