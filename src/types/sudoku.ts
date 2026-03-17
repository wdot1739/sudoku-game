export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | null;
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'won';

export interface Cell {
  value: CellValue;
  isGiven: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isError: boolean;
  notes: number[];
}

export type Board = Cell[][];

export interface GameState {
  board: Board;
  solution: CellValue[][];
  difficulty: Difficulty;
  status: GameStatus;
  timer: number;
  mistakes: number;
  maxMistakes: number;
  selectedCell: [number, number] | null;
  noteMode: boolean;
  history: Board[];
}
