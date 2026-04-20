export type Frequency = 'daily' | 'weekly' | 'custom';

export type WeekDay = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface JournalEntry {
  id: string;
  date: string; // ISO String
  content: string;
}

export interface HabitGoal {
  type: 'streak' | 'weekly' | 'total';
  value: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  frequency: Frequency;
  customDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  completedDates: string[]; // ISO Date strings "YYYY-MM-DD"
  createdAt: string;
  
  // New Features
  category?: string; // New Category Field
  targetStreak?: number; // Legacy/Quick access Goal: e.g., Reach 30 days
  goal?: HabitGoal; // Flexible Goal System
  journal: JournalEntry[];
  archived?: boolean;
  isNonNegotiable?: boolean; // Part of Discipline OS
}

export interface TimeBlock {
  id: string;
  label: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isEnabled: boolean;
  type: 'work' | 'rest' | 'personal' | 'routine';
}

export interface DailyCheckIn {
  morningMood?: string;
  morningNotes?: string;
  topThreeTasks: string[];
  eveningReflection?: string;
  dayRating?: 'perfect' | 'good' | 'missed';
  completedAt?: string;
}

export interface DisciplineStats {
  score: number;
  zeroDayCount: number;
  savedDayStreak: number;
  perfectDayStreak: number;
}

export interface AppSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  customLogo?: string | null;
  focusModeEnabled?: boolean;
}

export type ViewState = 'today' | 'add' | 'progress' | 'settings' | 'habit-detail' | 'routine' | 'focus';

// For the chart
export interface WeeklyStats {
  day: string;
  completed: number;
  total: number;
}