import React, { useState } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { HabitCard } from '../components/HabitCard.tsx';
import { isHabitDueOnDate, formatDateKey, calculateUserLevel } from '../utils.ts';
import { Zap } from 'lucide-react';

export const TodayView: React.FC = () => {
  const { habits, settings } = useHabitContext();
  const [logoError, setLogoError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  // Filter habits due today AND not archived
  const activeHabits = habits.filter(h => !h.archived);
  const todaysHabits = activeHabits.filter(habit => isHabitDueOnDate(habit, today));
  
  // Calculate Progress
  const todayKey = formatDateKey(today);
  const completedCount = todaysHabits.filter(h => h.completedDates.includes(todayKey)).length;
  const progress = todaysHabits.length > 0 ? (completedCount / todaysHabits.length) * 100 : 0;

  // Gamification
  const totalAllCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  const level = calculateUserLevel(totalAllCompletions);
  const currentLevelProgress = totalAllCompletions % 10;

  // Category Logic
  const categories = ['All', ...new Set(activeHabits.map(h => h.category || 'Other'))];
  const filteredHabits = selectedCategory === 'All' 
    ? todaysHabits 
    : todaysHabits.filter(h => (h.category || 'Other') === selectedCategory);

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto animate-fade-in">
      {/* Top Branding Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
           <div className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden relative">
              {settings.customLogo ? (
                 <img 
                   src={settings.customLogo} 
                   alt="Habito" 
                   className="w-full h-full object-cover" 
                 />
              ) : (
                <>
                   {/* Try loading logo.png if no custom logo set, otherwise fallback */}
                   <img 
                      src="logo.png" 
                      alt="Habito" 
                      className={`w-full h-full object-cover ${logoError ? 'hidden' : 'block'}`}
                      onError={() => setLogoError(true)}
                    />
                    {logoError && (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                        H
                      </div>
                    )}
                </>
              )}
           </div>
           <span className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">Habito</span>
        </div>

        {/* Level Badge - Moved here for better header balance */}
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-2xl flex flex-col items-end min-w-[70px] border border-yellow-200 dark:border-yellow-800/50">
          <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400 font-bold text-xs">
            <Zap size={14} className="fill-yellow-500" />
            <span>LVL {level}</span>
          </div>
          <div className="w-full h-1 bg-yellow-200 dark:bg-yellow-900 rounded-full mt-1 overflow-hidden">
             <div 
               className="h-full bg-yellow-500 transition-all duration-500" 
               style={{ width: `${(currentLevelProgress / 10) * 100}%` }}
             />
          </div>
        </div>
      </div>

      {/* Greeting Section */}
      <header className="mb-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide mb-1">
          {dateString}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {greeting}!
        </h1>
      </header>

      {/* Category Filters */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all
                ${selectedCategory === cat 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Daily Progress */}
      {todaysHabits.length > 0 && selectedCategory === 'All' && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Daily Goal</span>
            <span className="text-2xl font-bold text-brand-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Habit List */}
      <div className="space-y-4">
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <div className="text-6xl mb-4">🌴</div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
               {selectedCategory === 'All' ? 'No habits for today!' : `No ${selectedCategory} habits for today.`}
            </p>
            <p className="text-sm text-gray-500">
               {selectedCategory === 'All' ? 'Enjoy your free time or add a new habit.' : 'Switch categories or add a new habit.'}
            </p>
          </div>
        ) : (
          filteredHabits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))
        )}
      </div>
    </div>
  );
};