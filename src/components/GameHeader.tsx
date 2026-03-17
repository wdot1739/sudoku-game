import type { Difficulty, GameStatus } from '@/types/sudoku';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GameHeaderProps {
  time: number;
  mistakes: number;
  maxMistakes: number;
  difficulty: Difficulty;
  status: GameStatus;
  onPauseResume: () => void;
  onNewGame: () => void;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  expert: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function GameHeader({
  time,
  mistakes,
  maxMistakes,
  difficulty,
  status,
  onPauseResume,
  onNewGame,
}: GameHeaderProps) {
  const isRunning = status === 'playing';

  return (
    <div className="game-header">
      <div className="header-left">
        <Badge variant="outline" className={difficultyColors[difficulty]}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onNewGame} className="text-muted-foreground">
          New Game
        </Button>
      </div>

      <div className="header-center">
        <div className="mistake-counter">
          <span className="mistake-icon">❌</span>
          <span>{mistakes}/{maxMistakes}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="timer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{formatTime(time)}</span>
        </div>
        <button className="pause-btn" onClick={onPauseResume}>
          {isRunning ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
