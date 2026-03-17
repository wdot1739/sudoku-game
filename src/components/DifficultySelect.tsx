import type { Difficulty } from '@/types/sudoku';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DifficultySelectProps {
  open: boolean;
  onSelect: (difficulty: Difficulty) => void;
  onClose: () => void;
}

const difficulties: { value: Difficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Perfect for beginners', color: '#22c55e' },
  { value: 'medium', label: 'Medium', desc: 'A moderate challenge', color: '#eab308' },
  { value: 'hard', label: 'Hard', desc: 'For experienced players', color: '#f97316' },
  { value: 'expert', label: 'Expert', desc: 'The ultimate test', color: '#ef4444' },
];

export default function DifficultySelect({ open, onSelect, onClose }: DifficultySelectProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Game</DialogTitle>
          <DialogDescription>Select difficulty</DialogDescription>
        </DialogHeader>
        <div className="difficulty-grid">
          {difficulties.map((d) => (
            <Button
              key={d.value}
              variant="outline"
              className="difficulty-btn"
              onClick={() => onSelect(d.value)}
            >
              <span className="diff-dot" style={{ backgroundColor: d.color }} />
              <span className="diff-label">{d.label}</span>
              <span className="diff-desc">{d.desc}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
