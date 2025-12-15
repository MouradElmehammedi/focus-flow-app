import { Task, FocusSession, Habit, Goal } from '@/types';

const STORAGE_PREFIX = 'focusflow';

const KEYS = {
  TASKS: `${STORAGE_PREFIX}.tasks`,
  SESSIONS: `${STORAGE_PREFIX}.sessions`,
  HABITS: `${STORAGE_PREFIX}.habits`,
  GOALS: `${STORAGE_PREFIX}.goals`,
  TIMER_STATE: `${STORAGE_PREFIX}.timerState`,
};

// Generic storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

// Tasks
export function getTasks(): Task[] {
  return getFromStorage<Task[]>(KEYS.TASKS, []);
}

export function saveTasks(tasks: Task[]): void {
  setToStorage(KEYS.TASKS, tasks);
}

export function addTask(task: Task): void {
  const tasks = getTasks();
  saveTasks([...tasks, task]);
}

export function updateTask(taskId: string, updates: Partial<Task>): void {
  const tasks = getTasks();
  const updatedTasks = tasks.map(task =>
    task.id === taskId ? { ...task, ...updates } : task
  );
  saveTasks(updatedTasks);
}

export function deleteTask(taskId: string): void {
  const tasks = getTasks();
  saveTasks(tasks.filter(task => task.id !== taskId));
}

// Focus Sessions
export function getFocusSessions(): FocusSession[] {
  return getFromStorage<FocusSession[]>(KEYS.SESSIONS, []);
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  setToStorage(KEYS.SESSIONS, sessions);
}

export function addFocusSession(session: FocusSession): void {
  const sessions = getFocusSessions();
  saveFocusSessions([...sessions, session]);
}

// Habits
export function getHabits(): Habit[] {
  return getFromStorage<Habit[]>(KEYS.HABITS, []);
}

export function saveHabits(habits: Habit[]): void {
  setToStorage(KEYS.HABITS, habits);
}

export function addHabit(habit: Habit): void {
  const habits = getHabits();
  saveHabits([...habits, habit]);
}

export function updateHabit(habitId: string, updates: Partial<Habit>): void {
  const habits = getHabits();
  const updatedHabits = habits.map(habit =>
    habit.id === habitId ? { ...habit, ...updates } : habit
  );
  saveHabits(updatedHabits);
}

export function deleteHabit(habitId: string): void {
  const habits = getHabits();
  saveHabits(habits.filter(habit => habit.id !== habitId));
}

export function toggleHabitCompletion(habitId: string, date: string): void {
  const habits = getHabits();
  const updatedHabits = habits.map(habit => {
    if (habit.id !== habitId) return habit;

    const completions = [...habit.completions];
    const dateIndex = completions.indexOf(date);

    if (dateIndex > -1) {
      completions.splice(dateIndex, 1);
    } else {
      completions.push(date);
    }

    return { ...habit, completions };
  });
  saveHabits(updatedHabits);
}

// Goals
export function getGoals(): Goal[] {
  return getFromStorage<Goal[]>(KEYS.GOALS, []);
}

export function saveGoals(goals: Goal[]): void {
  setToStorage(KEYS.GOALS, goals);
}

export function addGoal(goal: Goal): void {
  const goals = getGoals();
  saveGoals([...goals, goal]);
}

export function updateGoal(goalId: string, updates: Partial<Goal>): void {
  const goals = getGoals();
  const updatedGoals = goals.map(goal =>
    goal.id === goalId ? { ...goal, ...updates } : goal
  );
  saveGoals(updatedGoals);
}

export function deleteGoal(goalId: string): void {
  const goals = getGoals();
  saveGoals(goals.filter(goal => goal.id !== goalId));
}

// Timer State Persistence
export interface TimerStateData {
  timeLeft: number;
  state: 'idle' | 'running' | 'paused';
  lastUpdated: string;
}

export function getTimerState(): TimerStateData | null {
  return getFromStorage<TimerStateData | null>(KEYS.TIMER_STATE, null);
}

export function saveTimerState(state: TimerStateData): void {
  setToStorage(KEYS.TIMER_STATE, state);
}

export function clearTimerState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KEYS.TIMER_STATE);
  }
}
