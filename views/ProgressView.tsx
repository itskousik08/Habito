import React, { useMemo, useState } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { formatDateKey, getDaysInMonth, getFirstDayOfMonth, calculateStreak } from '../utils.ts';
import { X, Check, Award, Star, Zap, Medal, Flame, TrendingUp } from 'lucide-react';

type TimeRange = '7d' | '30d' | '60d' | '90d';

export const ProgressView: React.FC = () => {
  const { habits, disciplineStats } = useHabitContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter for categories first
  const categories = useMemo(() => ['All', ...new Set(habits.filter(h => !h.archived).map(h => h.category || 'Other'))], [habits]);

  const activeHabits = useMemo(() => {
     let filtered = habits.filter(h => !h.archived);
     if (selectedCategory !== 'All') {
         filtered = filtered.filter(h => (h.category || 'Other') === selectedCategory);
     }
     return filtered;
  }, [habits, selectedCategory]);

  // Calculate Chart Data based on selected range
  const chartData = useMemo(() => {
    const today = new Date();
    const daysToLookBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '60d' ? 60 : 90;
    
    const isWeeklyView = daysToLookBack > 30;
    
    if (isWeeklyView) {
      const weeks = [];
      let currentEnd = new Date(today);
      const numWeeks = Math.ceil(daysToLookBack / 7);
      
      for (let i = 0; i < numWeeks; i++) {
        const weekStart = new Date(currentEnd);
        weekStart.setDate(currentEnd.getDate() - 6);
        let weeklyTotal = 0;
        for (let d = 0; d < 7; d++) {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + d);
          const key = formatDateKey(day);
          const dailyCount = activeHabits.reduce((acc, h) => acc + (h.completedDates.includes(key) ? 1 : 0), 0);
          weeklyTotal += dailyCount;
        }

        weeks.unshift({
          label: `${weekStart.getDate()}/${weekStart.getMonth()+1}`,
          completed: weeklyTotal,
          fullDate: weekStart
        });
        currentEnd.setDate(currentEnd.getDate() - 7);
      }
      return weeks;
    } else {
      return Array.from({ length: daysToLookBack }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (daysToLookBack - 1 - i));
        const key = formatDateKey(d);
        const completedCount = activeHabits.reduce((acc, habit) => acc + (habit.completedDates.includes(key) ? 1 : 0), 0);
        return {
          label: d.toLocaleDateString('en-US', { weekday: 'narrow', day: 'numeric' }),
          completed: completedCount,
          fullDate: d
        };
      });
    }
  }, [activeHabits, timeRange]);

  // Monthly Heatmap Data
  const { heatmapData, currentMonthLabel } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const grid = [];
    for(let i=0; i<firstDay; i++) grid.push(null);
    for(let i=1; i<=daysInMonth; i++) {
        const d = new Date(year, month, i);
        const key = formatDateKey(d);
        const completedCount = activeHabits.reduce((acc, h) => acc + (h.completedDates.includes(key) ? 1 : 0), 0);
        const totalActive = activeHabits.length;
        const intensity = totalActive > 0 ? completedCount / totalActive : 0;
        grid.push({ date: i, intensity, count: completedCount, fullDate: d });
    }

    return { 
        heatmapData: grid,
        currentMonthLabel: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
  }, [activeHabits]);

  // Weekly Habit Stats Calculation
  const weeklyHabitStats = useMemo(() => {
    const now = new Date();
    // Get start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    const startKey = formatDateKey(startOfWeek);

    return activeHabits.map(habit => {
        let target = 7;
        if (habit.frequency === 'custom') target = habit.customDays.length;
        if (habit.goal?.type === 'weekly') target = habit.goal.value;
        
        // Count completions this week
        const completions = habit.completedDates.filter(d => d >= startKey).length;
        const percent = Math.min(100, Math.round((completions / target) * 100));

        return {
            ...habit,
            weeklyCompleted: completions,
            weeklyTarget: target,
            percent
        };
    }).sort((a, b) => b.percent - a.percent);
  }, [activeHabits]);

  const totalCompletions = habits.reduce((acc, h) => acc + h.completedDates.length, 0); 
  const currentCategoryCompletions = activeHabits.reduce((acc, h) => acc + h.completedDates.length, 0);

  const handleDayClick = (dayData: any) => {
    if (!dayData) return;
    const now = new Date();
    if (dayData.fullDate > now) return;
    setSelectedDate(dayData.fullDate);
  };

  const getSelectedDateStats = () => {
    if (!selectedDate) return null;
    const key = formatDateKey(selectedDate);
    const completed = activeHabits.filter(h => h.completedDates.includes(key));
    const pending = activeHabits.filter(h => !h.completedDates.includes(key));
    return {
      completedHabits: completed,
      missedHabits: pending,
      score: activeHabits.length > 0 ? Math.round((completed.length / activeHabits.length) * 100) : 0
    };
  };

  const selectedStats = getSelectedDateStats();
  const todayKey = formatDateKey(new Date());

  // Achievements Logic
  const achievements = [
    { id: 'start', label: 'First Step', desc: 'Complete your first habit', icon: Star, unlocked: totalCompletions > 0, color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' },
    { id: 'streak', label: 'On Fire', desc: 'Reach a 3-day streak', icon: Flame, unlocked: habits.some(h => calculateStreak(h) >= 3), color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' },
    { id: 'pro', label: 'Dedicated', desc: '20 Total Check-ins', icon: Medal, unlocked: totalCompletions >= 20, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
    { id: 'master', label: 'Habit Master', desc: '50 Total Check-ins', icon: Award, unlocked: totalCompletions >= 50, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Progress</h1>

      {/* Summary Cards - Discipline OS Version */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-black text-white p-5 rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800">
          <div className="text-4xl font-bold mb-1">{disciplineStats.perfectDayStreak}</div>
          <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">Perfect Streak</div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-orange-400 font-bold bg-orange-400/10 px-2 py-1 rounded-full w-fit">
            <Flame size={10} className="fill-orange-400" />
            ON FIRE
          </div>
        </div>
        <div className="bg-brand-600 text-white p-5 rounded-3xl shadow-xl shadow-brand-500/20">
          <div className="text-4xl font-bold mb-1">{disciplineStats.score}</div>
          <div className="text-brand-100 text-xs font-bold uppercase tracking-widest">Discipline Score</div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-brand-100 font-bold bg-white/10 px-2 py-1 rounded-full w-fit">
            <Zap size={10} className="fill-brand-100" />
            ELITE LEVEL
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{disciplineStats.savedDayStreak}</div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Recovery Streak</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          <div className="text-2xl font-bold text-red-500">{disciplineStats.zeroDayCount}</div>
          <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Zero Days (30d)</div>
        </div>
      </div>

      {/* Category Filter */}
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

      {/* Top Section: Chart OR Day Detail */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 min-h-[320px] transition-all">
        {selectedDate && selectedStats ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Daily Breakdown</p>
               </div>
               <button onClick={() => setSelectedDate(null)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                  <X size={20} className="text-gray-600 dark:text-gray-300" />
               </button>
            </div>
            
            <div className="flex items-center gap-6 mb-6">
               <div className="flex flex-col">
                 <span className="text-4xl font-bold text-brand-600">{selectedStats.score}%</span>
                 <span className="text-xs text-gray-400 font-medium">COMPLETED</span>
               </div>
               <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-700"></div>
               <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{selectedStats.completedHabits.length} <span className="text-gray-400 text-sm font-normal">/ {activeHabits.length}</span></span>
                  <span className="text-xs text-gray-400 font-medium">HABITS</span>
               </div>
            </div>

            <div className="space-y-3 max-h-[160px] overflow-y-auto no-scrollbar">
               {selectedStats.completedHabits.length === 0 && selectedStats.missedHabits.length === 0 && (
                 <p className="text-center text-gray-400 text-sm py-4">No habits active on this date.</p>
               )}
               {selectedStats.completedHabits.map(h => (
                  <div key={h.id} className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
                     <div className="text-lg">{h.emoji}</div>
                     <span className="font-medium text-gray-900 dark:text-white flex-1 text-sm">{h.name}</span>
                     <div className="bg-brand-500 rounded-full p-0.5"><Check size={12} className="text-white" strokeWidth={3} /></div>
                  </div>
               ))}
               {selectedStats.missedHabits.map(h => (
                  <div key={h.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 opacity-60">
                     <div className="text-lg grayscale">{h.emoji}</div>
                     <span className="font-medium text-gray-500 dark:text-gray-400 flex-1 text-sm">{h.name}</span>
                     <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                  </div>
               ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity</h3>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                {(['7d', '30d', '60d', '90d'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`
                      px-3 py-1 text-xs font-bold rounded-lg transition-all
                      ${timeRange === range 
                        ? 'bg-white dark:bg-gray-600 text-brand-600 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                      }
                    `}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9CA3AF', fontSize: 10 }} 
                    dy={10}
                    interval={timeRange === '7d' ? 0 : 'preserveStartEnd'}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="completed" radius={[4, 4, 4, 4]} barSize={timeRange === '7d' ? 24 : undefined}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">
              Tap a date below to view details
            </p>
          </>
        )}
      </div>

      {/* NEW: Weekly Performance by Habit */}
      {!selectedDate && (
        <div className="mb-8">
           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1 flex items-center gap-2">
             <TrendingUp size={20} className="text-brand-500" />
             Weekly Performance
           </h3>
           <div className="space-y-4">
              {weeklyHabitStats.map(habit => (
                <div key={habit.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-lg">
                           {habit.emoji}
                         </div>
                         <span className="font-bold text-sm text-gray-900 dark:text-white">{habit.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500">
                        {habit.weeklyCompleted} <span className="font-normal text-gray-400">/ {habit.weeklyTarget}</span>
                      </span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${habit.percent}%`,
                          backgroundColor: habit.color 
                        }}
                      />
                   </div>
                </div>
              ))}
              {weeklyHabitStats.length === 0 && (
                <div className="text-center text-gray-400 text-sm py-4">No {selectedCategory !== 'All' ? selectedCategory : ''} habits to show.</div>
              )}
           </div>
        </div>
      )}

      {/* Monthly Heatmap */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Consistency</h3>
            <span className="text-xs text-brand-600 font-medium bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full">
                {currentMonthLabel}
            </span>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-xs font-bold text-gray-400 mb-1">{d}</div>
            ))}
            {heatmapData.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dayKey = formatDateKey(day.fullDate);
                const isSelected = selectedDate && formatDateKey(selectedDate) === dayKey;
                const isToday = dayKey === todayKey;
                const isFuture = day.fullDate > new Date();
                
                // Dynamic Color Calculation
                const alpha = day.intensity === 0 ? 0 : 0.2 + (day.intensity * 0.8);
                const bgColor = day.intensity === 0 
                    ? undefined 
                    : `rgba(59, 130, 246, ${alpha})`; // Using brand blue RGB
                
                return (
                    <button 
                        key={day.date}
                        onClick={() => handleDayClick(day)}
                        disabled={isFuture}
                        style={{ 
                           backgroundColor: bgColor,
                           color: day.intensity > 0.5 ? 'white' : undefined
                        }}
                        className={`
                          aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all relative
                          ${day.intensity === 0 ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : ''}
                          ${isSelected ? 'ring-2 ring-brand-600 ring-offset-2 dark:ring-offset-gray-800 z-10' : ''}
                          ${isToday && !isSelected ? 'ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-gray-800 z-10' : ''}
                          ${!isFuture ? 'cursor-pointer hover:scale-110 active:scale-95' : 'opacity-30 cursor-default'}
                        `}
                    >
                        {day.date}
                    </button>
                )
            })}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
           {achievements.map((a) => {
             const Icon = a.icon;
             return (
               <div 
                 key={a.id} 
                 className={`
                   p-4 rounded-2xl border transition-all
                   ${a.unlocked 
                     ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm' 
                     : 'bg-gray-50 dark:bg-gray-800/50 border-transparent opacity-60'
                   }
                 `}
               >
                 <div className="flex items-start justify-between mb-2">
                   <div className={`p-2 rounded-xl ${a.unlocked ? a.color : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                     <Icon size={20} />
                   </div>
                   {a.unlocked && <Check size={16} className="text-green-500" />}
                 </div>
                 <div className="font-bold text-sm text-gray-900 dark:text-white">{a.label}</div>
                 <div className="text-xs text-gray-500 dark:text-gray-400">{a.desc}</div>
               </div>
             )
           })}
        </div>
      </div>

      {/* Quote */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 p-6 rounded-3xl text-white shadow-lg text-center">
        <h3 className="text-lg font-bold mb-2">Daily Inspiration</h3>
        <p className="opacity-90 text-sm italic">"Consistency is what transforms average into excellence."</p>
      </div>
    </div>
  );
};