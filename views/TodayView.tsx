import React, { useState } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { HabitCard } from '../components/HabitCard.tsx';
import { isHabitDueOnDate, formatDateKey, calculateUserLevel, getDayStatus } from '../utils.ts';
import { Zap, Check, Trophy, Sparkles, BookOpen, Calendar, Flame } from 'lucide-react';

export const TodayView: React.FC = () => {
  const { habits, settings, disciplineStats, toggleFocusMode, navigate, checkIns, updateCheckIn } = useHabitContext();
  const [logoError, setLogoError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const today = new Date();
  const todayKey = formatDateKey(today);
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  // Filter habits due today AND not archived
  const activeHabits = habits.filter(h => !h.archived);
  const todaysHabits = activeHabits.filter(habit => isHabitDueOnDate(habit, today));
  
  // Non-Negotiables
  const nonNegotiables = todaysHabits.filter(h => h.isNonNegotiable);
  const regularHabits = todaysHabits.filter(h => !h.isNonNegotiable);
  
  // Calculate Progress
  const completedCount = todaysHabits.filter(h => h.completedDates.includes(todayKey)).length;
  const progress = todaysHabits.length > 0 ? (completedCount / todaysHabits.length) * 100 : 0;

  // Check-in status
  const currentCheckIn = checkIns[todayKey];
  const isMorningDone = !!currentCheckIn?.morningMood;
  const isNightDone = !!currentCheckIn?.dayRating;

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

        {/* Level Badge & Discipline Score */}
        <div className="flex gap-2">
          {/* Level Badge */}
          <div 
            onClick={() => navigate('progress')}
            className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-2xl flex flex-col items-end min-w-[70px] border border-yellow-200 dark:border-yellow-800/50 cursor-pointer"
          >
            <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400 font-bold text-[10px]">
              <Trophy size={12} className="fill-yellow-500" />
              <span>LVL {calculateUserLevel(habits.reduce((acc, h) => acc + h.completedDates.length, 0))}</span>
            </div>
            <div className="w-full h-1 bg-yellow-200 dark:bg-yellow-900 rounded-full mt-1 overflow-hidden">
               <div 
                 className="h-full bg-yellow-500 transition-all duration-500" 
                 style={{ width: `${(habits.reduce((acc, h) => acc + h.completedDates.length, 0) % 10 / 10) * 100}%` }}
               />
            </div>
          </div>

          {/* Discipline Score */}
          <div 
            onClick={() => navigate('progress')}
            className="bg-brand-50 dark:bg-brand-900/10 px-3 py-1.5 rounded-2xl flex flex-col items-end min-w-[70px] border border-brand-100 dark:border-brand-800/50 cursor-pointer shadow-sm active:scale-95 transition-all"
          >
            <div className="flex items-center gap-1 text-brand-700 dark:text-brand-400 font-bold text-[10px]">
              <Zap size={10} className="fill-brand-500" />
              <span>SCORE {disciplineStats.score}</span>
            </div>
            <div className="w-full h-1.5 bg-brand-100 dark:bg-brand-900 rounded-full mt-1.5 overflow-hidden">
               <div 
                 className="h-full bg-brand-500 transition-all duration-700" 
                 style={{ width: `${disciplineStats.score}%` }}
               />
            </div>
          </div>
        </div>
      </div>

      {/* Streak Dashboard - Quick View */}
      <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
             <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
               <Flame size={18} className="text-orange-500 fill-orange-500" />
             </div>
             <div>
                <div className="text-sm font-bold dark:text-white">{disciplineStats.perfectDayStreak}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Perfect Days</div>
             </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
             <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
               <Zap size={18} className="text-brand-500 fill-brand-500" />
             </div>
             <div>
                <div className="text-sm font-bold dark:text-white">{disciplineStats.savedDayStreak}</div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Recovery Streak</div>
             </div>
          </div>
      </div>

      {/* Greeting Section */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">
            {dateString}
          </p>
          {getDayStatus(habits, todayKey) === 'zero' && todaysHabits.length > 0 && (
             <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold animate-pulse">
               ZERO DAY DETECTED
             </span>
          )}
        </div>
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

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <button 
          onClick={() => navigate('routine')}
          className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95"
        >
          <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-xl text-brand-600">
            <Calendar size={20} />
          </div>
          <span className="text-xs font-bold dark:text-white uppercase tracking-wider">Routine</span>
        </button>
        <button 
          onClick={() => navigate('focus')}
          className="flex-1 bg-gray-900 dark:bg-brand-600 p-4 rounded-3xl flex flex-col items-center gap-2 hover:bg-black dark:hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 active:scale-95 text-white"
        >
          <div className="p-2 bg-white/20 rounded-xl">
            <Zap size={20} className="fill-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider">Focus</span>
        </button>
      </div>

      {/* Daily Progress */}
      {todaysHabits.length > 0 && selectedCategory === 'All' && (
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Completion</span>
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

      {/* Non-Negotiables Section */}
      {nonNegotiables.length > 0 && selectedCategory === 'All' && (
        <div className="mb-8">
          <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Non-Negotiables
          </h2>
          <div className="space-y-4">
            {nonNegotiables.map(habit => (
              <div key={habit.id} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <HabitCard habit={habit} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit List */}
      <div className="space-y-4 mb-12">
        {selectedCategory === 'All' && regularHabits.length > 0 && (
           <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
             Active Habits
           </h2>
        )}
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

      {/* Daily Check-ins */}
      {selectedCategory === 'All' && (
        <div className="space-y-6 pb-20">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Review</h2>
          
          {/* Morning Check-in */}
          <div className={`p-6 rounded-3xl border transition-all ${isMorningDone ? 'bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 dark:bg-brand-900/30 rounded-xl text-brand-600">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Morning Alignment</h3>
               </div>
               {isMorningDone && <Check size={20} className="text-green-500" />}
            </div>
            
            {!isMorningDone ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Set your mood and intention for the day.</p>
                <div className="flex justify-between">
                  {['🔥', '⚡', '🧘', '😴', '🧠'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => updateCheckIn(todayKey, { morningMood: m })}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Intention set. Focus on execution.</p>
            )}
          </div>

          {/* Evening Check-in */}
          <div className={`p-6 rounded-3xl border transition-all ${isNightDone ? 'bg-brand-50/30 dark:bg-brand-900/10 border-brand-100 dark:border-brand-900/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
            <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Night Reflection</h3>
               </div>
               {isNightDone && <Check size={20} className="text-purple-500" />}
            </div>
            
            {isMorningDone && !isNightDone ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Rate your discipline today.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Perfect', val: 'perfect', icon: '✅' },
                    { label: 'Good', val: 'good', icon: '⚡' },
                    { label: 'Missed', val: 'missed', icon: '❌' }
                  ].map(r => {
                    const allNNdone = nonNegotiables.every(h => h.completedDates.includes(todayKey));
                    const isDisabled = r.val === 'perfect' && !allNNdone;
                    
                    return (
                      <button 
                        key={r.val}
                        disabled={isDisabled}
                        onClick={() => updateCheckIn(todayKey, { dayRating: r.val as any })}
                        className={`
                          flex flex-col items-center gap-1 p-3 rounded-2xl transition-all
                          ${isDisabled 
                            ? 'opacity-40 grayscale pointer-events-none' 
                            : 'bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                          }
                        `}
                      >
                        <span className="text-xl">{r.icon}</span>
                        <span className="text-[10px] font-bold uppercase">{r.label}</span>
                      </button>
                    )
                  })}
                </div>
                {!nonNegotiables.every(h => h.completedDates.includes(todayKey)) && (
                   <p className="text-[10px] text-red-500 font-bold uppercase text-center animate-pulse">
                     Complete all non-negotiables for a Perfect Day
                   </p>
                )}
              </div>
            ) : !isMorningDone ? (
               <p className="text-sm text-gray-400 italic">Complete morning alignment first.</p>
            ) : (
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400">Reflection recorded. Rest well.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
