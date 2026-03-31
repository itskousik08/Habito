import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habit, AppSettings, ViewState, JournalEntry } from '../types.ts';
import { formatDateKey } from '../utils.ts';

interface HabitContextType {
  habits: Habit[];
  settings: AppSettings;
  currentView: ViewState;
  selectedHabitId: string | null;
  
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates' | 'journal'> & { initialNote?: string }) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: Date) => void;
  toggleArchive: (id: string) => void;
  addJournalEntry: (habitId: string, content: string) => void;
  
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
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
};

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

  const [currentView, setCurrentView] = useState<ViewState>('today');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('habitflow_habits', JSON.stringify(habits));
  }, [habits]);

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
  const setCustomLogo = (logo: string | null) => setSettings(s => ({ ...s, customLogo: logo }));
  
  const resetAll = () => {
    if(confirm("Reset all data? This cannot be undone.")) {
      setHabits([]);
      localStorage.removeItem('habitflow_habits');
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
        addHabit,
        updateHabit,
        deleteHabit,
        toggleCompletion,
        toggleArchive,
        addJournalEntry,
        toggleTheme,
        toggleSound,
        toggleAnimations,
        setCustomLogo,
        resetAll,
        navigate,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};