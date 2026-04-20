import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Habit, AppSettings, ViewState, JournalEntry, TimeBlock, DailyCheckIn, DisciplineStats } from '../types.ts';
import { formatDateKey, calculateDisciplineScore, getDayStatus } from '../utils.ts';

interface HabitContextType {
  habits: Habit[];
  settings: AppSettings;
  currentView: ViewState;
  selectedHabitId: string | null;
  routine: TimeBlock[];
  checkIns: Record<string, DailyCheckIn>;
  disciplineStats: DisciplineStats;
  
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'journal'> & { initialNote?: string }) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: Date) => void;
  toggleArchive: (id: string) => void;
  toggleNonNegotiable: (id: string) => void;
  addJournalEntry: (habitId: string, content: string) => void;
  
  updateRoutine: (blocks: TimeBlock[]) => void;
  updateCheckIn: (dateKey: string, data: Partial<DailyCheckIn>) => void;
  
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
  toggleFocusMode: () => void;
  setCustomLogo: (logo: string | null) => void;
  resetAll: () => void;
  
  navigate: (view: ViewState, habitId?: string) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabitContext = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabitContext must be used within a HabitProvider');
  return context;
};

// Initial Data for demo purposes if storage is empty
const INITIAL_HABITS: Habit[] = [];
const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  soundEnabled: true,
  animationsEnabled: true,
  customLogo: null,
  focusModeEnabled: false,
};

const INITIAL_ROUTINE: TimeBlock[] = [
  { id: '1', label: 'Wake Up', startTime: '06:00', endTime: '06:30', isEnabled: true, type: 'routine' },
  { id: '2', label: 'Workout', startTime: '07:00', endTime: '08:00', isEnabled: true, type: 'work' },
  { id: '3', label: 'Deep Work Block 1', startTime: '09:00', endTime: '12:00', isEnabled: true, type: 'work' },
  { id: '4', label: 'Learning', startTime: '20:00', endTime: '21:00', isEnabled: true, type: 'personal' },
];

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('habitflow_habits');
      return saved ? JSON.parse(saved) : INITIAL_HABITS;
    } catch (e) {
      console.error("Failed to parse habits from localStorage", e);
      return INITIAL_HABITS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('habitflow_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch (e) {
      console.error("Failed to parse settings from localStorage", e);
      return INITIAL_SETTINGS;
    }
  });

  const [routine, setRoutine] = useState<TimeBlock[]>(() => {
    const saved = localStorage.getItem('habitflow_routine');
    return saved ? JSON.parse(saved) : INITIAL_ROUTINE;
  });

  const [checkIns, setCheckIns] = useState<Record<string, DailyCheckIn>>(() => {
    const saved = localStorage.getItem('habitflow_checkins');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentView, setCurrentView] = useState<ViewState>('today');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const disciplineStats = useMemo(() => {
    const score = calculateDisciplineScore(habits, checkIns);
    
    // Calculate streaks and zero days from history
    let zeroDayCount = 0;
    let savedDayStreak = 0;
    let perfectDayStreak = 0;

    const today = new Date();
    
    // Calculate Perfect Streak (all habits done)
    let currentCheck = new Date(today);
    // If today is still in progress, check from yesterday if today isn't perfect yet
    const todayKey = formatDateKey(currentCheck);
    const todayStatus = getDayStatus(habits, todayKey);
    
    if (todayStatus !== 'perfect') {
      currentCheck.setDate(currentCheck.getDate() - 1);
    }

    while (true) {
      const key = formatDateKey(currentCheck);
      const status = getDayStatus(habits, key);
      if (status === 'perfect') {
        perfectDayStreak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate Saved Streak (no zero days)
    currentCheck = new Date(today);
    if (todayStatus === 'zero') {
      currentCheck.setDate(currentCheck.getDate() - 1);
    }

    while (true) {
      const key = formatDateKey(currentCheck);
      const status = getDayStatus(habits, key);
      if (status !== 'zero' && status !== 'neutral') {
        savedDayStreak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }

    // Count Zero Days in last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (getDayStatus(habits, formatDateKey(d)) === 'zero') {
        zeroDayCount++;
      }
    }
    
    return { score, zeroDayCount, savedDayStreak, perfectDayStreak };
  }, [habits, checkIns]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('habitflow_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habitflow_routine', JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem('habitflow_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('habitflow_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Actions
  const addHabit = (data: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'journal'> & { initialNote?: string }) => {
    // If user set a goal of type streak, we sync it to targetStreak for backward compatibility/UI ease
    const effectiveTargetStreak = data.goal?.type === 'streak' ? data.goal.value : data.targetStreak;

    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      completedDates: [],
      name: data.name,
      description: data.description,
      emoji: data.emoji,
      color: data.color,
      frequency: data.frequency,
      customDays: data.customDays,
      category: data.category || 'Other',
      targetStreak: effectiveTargetStreak, 
      goal: data.goal,
      isNonNegotiable: data.isNonNegotiable || false,
      journal: data.initialNote ? [{
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        content: data.initialNote
      }] : [],
      archived: false
    };
    setHabits((prev) => [...prev, newHabit]);
    navigate('today');
  };

  const updateHabit = (updatedHabit: Habit) => {
    setHabits((prev) => prev.map((h) => (h.id === updatedHabit.id ? updatedHabit : h)));
  };

  const deleteHabit = (id: string) => {
    if(confirm("Are you sure you want to permanently delete this habit?")) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      navigate('today');
    }
  };

  const toggleArchive = (id: string) => {
    setHabits((prev) => prev.map((h) => h.id === id ? { ...h, archived: !h.archived } : h));
  };

  const toggleNonNegotiable = (id: string) => {
    setHabits((prev) => prev.map((h) => h.id === id ? { ...h, isNonNegotiable: !h.isNonNegotiable } : h));
  };

  const updateRoutine = (blocks: TimeBlock[]) => {
    setRoutine(blocks);
  };

  const updateCheckIn = (dateKey: string, data: Partial<DailyCheckIn>) => {
    setCheckIns(prev => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || { topThreeTasks: [] }), ...data }
    }));
  };

  const toggleCompletion = (id: string, date: Date) => {
    const dateKey = formatDateKey(date);
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;
        
        const isCompleted = habit.completedDates.includes(dateKey);
        let newDates;
        
        if (isCompleted) {
          newDates = habit.completedDates.filter((d) => d !== dateKey);
        } else {
          newDates = [...habit.completedDates, dateKey];
        }
        
        return { ...habit, completedDates: newDates };
      })
    );
  };

  const addJournalEntry = (habitId: string, content: string) => {
    setHabits((prev) => prev.map(habit => {
      if (habit.id !== habitId) return habit;
      const newEntry: JournalEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        content
      };
      return { ...habit, journal: [newEntry, ...habit.journal] };
    }));
  };

  const toggleTheme = () => setSettings(s => ({ ...s, darkMode: !s.darkMode }));
  const toggleSound = () => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }));
  const toggleAnimations = () => setSettings(s => ({ ...s, animationsEnabled: !s.animationsEnabled }));
  const toggleFocusMode = () => setSettings(s => ({ ...s, focusModeEnabled: !s.focusModeEnabled }));
  const setCustomLogo = (logo: string | null) => setSettings(s => ({ ...s, customLogo: logo }));
  
  const resetAll = () => {
    if(confirm("Reset all data? This cannot be undone.")) {
      setHabits([]);
      setRoutine(INITIAL_ROUTINE);
      setCheckIns({});
      localStorage.removeItem('habitflow_habits');
      localStorage.removeItem('habitflow_routine');
      localStorage.removeItem('habitflow_checkins');
    }
  };

  const navigate = (view: ViewState, habitId?: string) => {
    setCurrentView(view);
    if (habitId) setSelectedHabitId(habitId);
    else if (view !== 'habit-detail') setSelectedHabitId(null);
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        settings,
        currentView,
        selectedHabitId,
        routine,
        checkIns,
        disciplineStats,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        toggleArchive,
        toggleNonNegotiable,
        addJournalEntry,
        updateRoutine,
        updateCheckIn,
        toggleTheme,
        toggleSound,
        toggleAnimations,
        toggleFocusMode,
        setCustomLogo,
        resetAll,
        navigate,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};