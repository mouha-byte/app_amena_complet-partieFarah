import { Activity, ActivityLevel } from '../services/activity.service';

export interface QuizActivity extends Activity {
  theme: string; // Quiz theme (MEMORY, LOGIC, etc.)
  questions?: QuizQuestion[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizQuestion {
  id?: number;
  text: string;
  score: number;
  correctAnswer: string;
  optionA: string;
  optionB: string;
  optionC: string;
}

export type QuizLevel = ActivityLevel;
