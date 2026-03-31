import { Habit } from './types.ts';

// Format date to YYYY-MM-DD for storage keys
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Check if a habit is completed on a specific date
export const isHabitCompleted = (habit: Habit, dateKey: string): boolean => {
  return habit.completedDates.includes(dateKey);
};

// Calculate streak
export const calculateStreak = (habit: Habit): number => {
  let streak = 0;
  const today = new Date();
  
  let currentCheck = new Date(today);
  const todayKey = formatDateKey(currentCheck);
  
  if (!habit.completedDates.includes(todayKey)) {
     currentCheck.setDate(currentCheck.getDate() - 1);
     if (!habit.completedDates.includes(formatDateKey(currentCheck))) {
       return 0;
     }
  }

  while (true) {
    const key = formatDateKey(currentCheck);
    if (habit.completedDates.includes(key)) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Check if habit is due today
export const isHabitDueOnDate = (habit: Habit, date: Date): boolean => {
  const dayIndex = date.getDay(); // 0-6
  
  if (habit.frequency === 'daily') return true;
  if (habit.frequency === 'custom') {
    return habit.customDays.includes(dayIndex);
  }
  if (habit.frequency === 'weekly') return true; 

  return true;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Gamification: Calculate User Level
export const calculateUserLevel = (totalCompletions: number) => {
  // Simple formula: Level 1 starts at 0. Every 10 completions = 1 Level up.
  // Level 1: 0-9, Level 2: 10-19, etc.
  return Math.floor(totalCompletions / 10) + 1;
};

// Calendar Helpers
export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export const ALL_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export const COMMON_EMOJIS = [
  '💧', '🏃', '📚', '🧘', '🥦', '💊', '💤', '🏋️', 
  '💻', '🎨', '🎸', '🧹', '📝', '🥗', '🚶', '🌱'
];

export const CATEGORIES = [
  'Health', 'Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Finance', 'Social', 'Creativity', 'Other'
];

export const MOTIVATIONAL_QUOTES = [
  "Consistency is what transforms average into excellence.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your future is created by what you do today, not tomorrow.",
  "The only bad workout is the one that didn't happen.",
  "Don't stop when you're tired. Stop when you're done.",
  "Motivation is what gets you started. Habit is what keeps you going."
];

export const getRandomQuote = () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];