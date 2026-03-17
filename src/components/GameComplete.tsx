import { motion, AnimatePresence } from 'framer-motion';
import type { Difficulty } from '@/types/sudoku';
import { Button } from '@/components/ui/button';

interface GameCompleteProps {
  open: boolean;
  time: number;
  mistakes: number;
  difficulty: Difficulty;
  onPlayAgain: () => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function GameComplete({
  open,
  time,
  mistakes,
  difficulty,
  onPlayAgain,
}: GameCompleteProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content victory"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="victory-icon">🎉</div>
            <h2 className="modal-title">Puzzle Complete!</h2>
            <div className="victory-stats">
              <div className="stat">
                <span className="stat-label">Time</span>
                <span className="stat-value">{formatTime(time)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Mistakes</span>
                <span className="stat-value">{mistakes}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Difficulty</span>
                <span className="stat-value">{difficultyLabels[difficulty]}</span>
              </div>
            </div>
            <Button size="lg" onClick={onPlayAgain} className="play-again-btn">
              Play Again
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
