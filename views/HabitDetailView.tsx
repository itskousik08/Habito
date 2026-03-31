import React, { useMemo, useState } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { ArrowLeft, Trash2, Calendar as CalendarIcon, Flame, Trophy, Lock, Book, PenLine, Send, Archive, RefreshCw } from 'lucide-react';
import { formatDateKey, calculateStreak, getDaysInMonth, getFirstDayOfMonth } from '../utils.ts';

type Tab = 'overview' | 'journal';

export const HabitDetailView: React.FC = () => {
  const { habits, selectedHabitId, navigate, deleteHabit, toggleCompletion, addJournalEntry, toggleArchive } = useHabitContext();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [newNote, setNewNote] = useState('');
  
  const habit = habits.find(h => h.id === selectedHabitId);
  
  const { calendarData, currentMonthName } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return { 
      calendarData: days,
      currentMonthName: now.toLocaleString('default', { month: 'long', year: 'numeric' })
    };
  }, []);

  if (!habit) {
    navigate('today');
    return null;
  }

  const streak = calculateStreak(habit);
  const totalCompletions = habit.completedDates.length;
  const todayKey = formatDateKey(new Date());
  
  // Only show progress if a goal is defined
  const hasGoal = !!habit.goal || !!habit.targetStreak;
  const target = habit.targetStreak || habit.goal?.value || 30; // Fallback to 30 only if needed for calc
  const progressPercent = hasGoal ? Math.min((streak / target) * 100, 100) : 0;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addJournalEntry(habit.id, newNote);
    setNewNote('');
  };

  const handleArchive = () => {
    if (!habit.archived) {
      if (confirm("Archive this habit? It will be moved to Settings > Archived Habits.")) {
        toggleArchive(habit.id);
        navigate('today');
      }
    } else {
      toggleArchive(habit.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-slide-up flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 pt-6 px-6 rounded-b-[3rem] shadow-sm flex-shrink-0 z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('today')} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft size={24} />
          </button>
          <div className="text-sm font-bold text-gray-400 tracking-wider">DETAILS</div>
          <div className="flex gap-2">
            <button 
               onClick={handleArchive}
               className="p-2 text-gray-400 hover:text-brand-500 transition-colors"
               title={habit.archived ? "Restore Habit" : "Archive Habit"}
            >
              {habit.archived ? <RefreshCw size={20} /> : <Archive size={20} />}
            </button>
            <button 
               onClick={() => deleteHabit(habit.id)}
               className="p-2 text-red-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center pb-6">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-3 shadow-inner"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {habit.emoji}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{habit.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{habit.description}</p>
          {habit.archived && (
            <span className="mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold rounded-full">
              ARCHIVED
            </span>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6 relative">
           <button 
             onClick={() => setActiveTab('overview')}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
           >
             <CalendarIcon size={16} /> Overview
           </button>
           <button 
             onClick={() => setActiveTab('journal')}
             className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'journal' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
           >
             <Book size={16} /> Journal
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
        {activeTab === 'overview' ? (
          <div className="animate-fade-in space-y-6">
            
            {/* Goal Progress Card - Conditional Render */}
            {hasGoal ? (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <p className="text-indigo-100 text-sm font-medium mb-1">Current Streak</p>
                       <h2 className="text-4xl font-bold flex items-center gap-2">
                         {streak} <span className="text-lg opacity-80 font-normal">days</span>
                       </h2>
                     </div>
                     <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Trophy size={24} className="text-yellow-300" />
                     </div>
                   </div>
                   
                   <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider opacity-80">
                     <span>Goal Progress</span>
                     <span>{streak} / {target}</span>
                   </div>
                   <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-white h-full rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                      />
                   </div>
                   {streak >= target && (
                     <div className="mt-4 bg-yellow-400/20 border border-yellow-300/30 rounded-xl p-3 flex items-center gap-3">
                       <Flame className="text-yellow-300" />
                       <p className="text-sm font-medium text-yellow-50">Goal Reached! Amazing work!</p>
                     </div>
                   )}
                 </div>
                 
                 {/* Background Deco */}
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            ) : (
              // Simple Streak Card when no goal
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
                 <div className="relative z-10">
                    <p className="text-indigo-100 text-sm font-medium mb-1">Current Streak</p>
                    <h2 className="text-4xl font-bold flex items-center gap-2">
                      {streak} <span className="text-lg opacity-80 font-normal">days</span>
                    </h2>
                 </div>
                 <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm relative z-10">
                    <Flame size={32} className="text-orange-300 fill-orange-400" />
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Check-ins</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompletions}</div>
               </div>
               <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="text-gray-400 text-xs font-bold uppercase mb-1">Consistency</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((totalCompletions / (getDaysInMonth(new Date().getFullYear(), new Date().getMonth()) || 1)) * 100)}%
                  </div>
               </div>
            </div>

            {/* Calendar */}
            <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentMonthName}</h3>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Lock size={10} /> Locked
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm">
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-xs font-bold text-gray-400">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendarData.map((date, idx) => {
                      if (!date) return <div key={`empty-${idx}`} />;
                      const key = formatDateKey(date);
                      const isDone = habit.completedDates.includes(key);
                      const isToday = key === todayKey;
                      const canInteract = isToday && !habit.archived;
                      return (
                        <button
                          key={key}
                          disabled={!canInteract}
                          onClick={() => toggleCompletion(habit.id, date)}
                          className={`
                            aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition-all relative
                            ${isDone ? 'text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700'}
                            ${isToday && !isDone ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                            ${!canInteract && !isDone ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          style={{ backgroundColor: isDone ? habit.color : undefined }}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
            </div>

          </div>
        ) : (
          <div className="animate-fade-in flex flex-col h-full">
            {/* Add Note Input */}
            {!habit.archived && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-start gap-3">
                    <div className="bg-brand-50 dark:bg-brand-900/20 p-2 rounded-full text-brand-600">
                      <PenLine size={20} />
                    </div>
                    <div className="flex-1">
                      <textarea 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="How did it go today? Any reflections?"
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none h-20"
                      />
                      <div className="flex justify-between items-center mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                        <span className="text-xs text-gray-400">Markdown supported</span>
                        <button 
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="bg-brand-600 text-white p-2 rounded-xl disabled:opacity-50 hover:bg-brand-700 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                </div>
              </div>
            )}

            {/* Journal List */}
            <div className="space-y-4 pb-8">
               {habit.journal && habit.journal.length > 0 ? (
                 habit.journal.map((entry) => (
                   <div key={entry.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                         <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-2"></div>
                         <div className="w-[1px] bg-gray-200 dark:bg-gray-700 flex-1 my-1"></div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex-1 border border-gray-50 dark:border-gray-700">
                         <div className="text-xs text-gray-400 font-medium mb-1">
                           {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </div>
                         <p className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-line leading-relaxed">
                           {entry.content}
                         </p>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 opacity-50">
                    <Book size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No journal entries yet.</p>
                    <p className="text-xs text-gray-400">Reflect on your progress to stay motivated.</p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};