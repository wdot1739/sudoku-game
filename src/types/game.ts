export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Cell {
  value: number | null;
  given: boolean;
  notes: Set<number>;
  error: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Cell[][];
  selected: Position | null;
  difficulty: Difficulty;
  mistakes: number;
  maxMistakes: number;
  time: number;
  isRunning: boolean;
  isComplete: boolean;
  notesMode: boolean;
  history: Cell[][][];
}
