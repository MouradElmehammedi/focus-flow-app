export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedTime?: number; // in minutes
  createdAt: string;
  completedAt?: string;
}

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  date: string;
  linkedTaskId?: string;
}

export interface Habit {
  id: string;
  title: string;
  targetPerWeek: number;
  completions: string[]; // array of ISO date strings
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  targetHours: number;
  currentHours: number;
  createdAt: string;
}

export type TimerState = 'idle' | 'running' | 'paused';
