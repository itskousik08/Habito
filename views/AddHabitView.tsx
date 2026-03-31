import React, { useState } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { ALL_COLORS, COMMON_EMOJIS, CATEGORIES } from '../utils.ts';
import { Frequency, HabitGoal } from '../types.ts';
import { X, Check, Sparkles, Target, BookOpen, Flame, Calendar, Hash, Trophy, Repeat, ArrowRight, Tag } from 'lucide-react';
import { HabitCard } from '../components/HabitCard.tsx';

// Pre-defined suggestions for "Quick Start"
const SUGGESTIONS = [
  { name: 'Drink Water', emoji: '💧', color: '#3b82f6', category: 'Health', desc: 'Stay hydrated' },
  { name: 'Read', emoji: '📚', color: '#8b5cf6', category: 'Learning', desc: 'Read 10 pages' },
  { name: 'Workout', emoji: '🏋️', color: '#ef4444', category: 'Fitness', desc: 'Exercise for 30m' },
  { name: 'Meditate', emoji: '🧘', color: '#10b981', category: 'Mindfulness', desc: 'Mindfulness' },
  { name: 'Sleep', emoji: '💤', color: '#1e3a8a', category: 'Health', desc: '8 hours sleep' },
];

export const AddHabitView: React.FC = () => {
  const { addHabit, navigate } = useHabitContext();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState(COMMON_EMOJIS[0]);
  const [color, setColor] = useState(ALL_COLORS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [customDays, setCustomDays] = useState<number[]>([0,1,2,3,4,5,6]);
  
  // Goal Toggle
  const [enableGoal, setEnableGoal] = useState(false);
  
  // Legacy Target Field mapped to state for backward compat
  const [targetStreak, setTargetStreak] = useState<number>(30);
  
  // New Goal Fields
  const [goalType, setGoalType] = useState<HabitGoal['type']>('streak');
  const [goalValue, setGoalValue] = useState<number>(30);

  const [initialNote, setInitialNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Only set goal data if enabled
    let finalTargetStreak = undefined;
    let finalGoal = undefined;

    if (enableGoal) {
      finalTargetStreak = goalType === 'streak' ? goalValue : targetStreak;
      finalGoal = { type: goalType, value: goalValue };
    }

    addHabit({
      name,
      description,
      emoji,
      color,
      category,
      frequency,
      customDays: frequency === 'custom' ? customDays : [0,1,2,3,4,5,6],
      targetStreak: finalTargetStreak, 
      goal: finalGoal,
      initialNote: initialNote.trim() || undefined
    });
  };

  const applySuggestion = (s: typeof SUGGESTIONS[0]) => {
    setName(s.name);
    setEmoji(s.emoji);
    setColor(s.color);
    setCategory(s.category);
    setDescription(s.desc);
  };

  const toggleDay = (dayIndex: number) => {
    setCustomDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex].sort()
    );
  };

  const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Mock habit for preview
  const previewHabit = {
    id: 'preview',
    name: name || 'Habit Name',
    description: description || 'Your motivation goes here',
    emoji: emoji,
    color: color,
    frequency,
    customDays,
    completedDates: [],
    createdAt: new Date().toISOString(),
    journal: [],
    category
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">New Habit</h2>
        <button onClick={() => navigate('today')} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500">
          <X size={20} />
        </button>
      </div>

      {/* Quick Start Suggestions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-500 uppercase tracking-wide">
          <Sparkles size={14} className="text-yellow-500" />
          Quick Start
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => applySuggestion(s)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:scale-105 transition-transform flex-shrink-0"
            >
              <span>{s.emoji}</span>
              <span className="text-sm font-medium dark:text-gray-200">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info Section */}
        <div className="space-y-6">
            {/* Live Preview */}
            <div className="pointer-events-none opacity-90 scale-[0.98] origin-top">
                <HabitCard habit={previewHabit} />
            </div>

            {/* Name Input */}
            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Habit Name</label>
            <div className="flex gap-3">
                <div className="relative group">
                    <button 
                    type="button"
                    className="w-14 h-14 text-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                    {emoji}
                    </button>
                    {/* Simple Emoji Picker Popover */}
                    <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl z-20 grid grid-cols-4 gap-1 w-48 border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                    {COMMON_EMOJIS.map(e => (
                        <button 
                        key={e} 
                        type="button" 
                        onClick={() => setEmoji(e)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                        >
                        {e}
                        </button>
                    ))}
                    </div>
                </div>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Drink Water"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white transition-all"
                required
                />
            </div>
            </div>
            
            {/* Category Picker */}
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <Tag size={16} className="text-brand-500" />
                   Category
               </label>
               <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                   {CATEGORIES.map(cat => (
                       <button
                           key={cat}
                           type="button"
                           onClick={() => setCategory(cat)}
                           className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all 
                               ${category === cat 
                                   ? 'bg-brand-600 text-white border-brand-600' 
                                   : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                               }`}
                       >
                           {cat}
                       </button>
                   ))}
               </div>
            </div>

            {/* Description / Motivation */}
            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Motivation</label>
            <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why do you want to build this habit?"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white transition-all"
            />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Color</label>
            <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar py-1">
                {ALL_COLORS.map(c => (
                <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600' : ''}`}
                    style={{ backgroundColor: c }}
                >
                    {color === c && <Check size={16} className="text-white" strokeWidth={3} />}
                </button>
                ))}
            </div>
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
              <div className="grid grid-cols-2 gap-3">
                  <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${frequency === 'daily' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
                  >
                  Every Day
                  </button>
                  <button
                  type="button"
                  onClick={() => setFrequency('custom')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${frequency === 'custom' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
                  >
                  Custom Days
                  </button>
              </div>

              {frequency === 'custom' && (
                  <div className="flex justify-between gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl mt-3 animate-fade-in border border-gray-200 dark:border-gray-700">
                  {WEEKDAYS.map((day, i) => {
                      const isSelected = customDays.includes(i);
                      return (
                      <button
                          key={i}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`
                          w-8 h-10 rounded-lg text-xs font-bold transition-all
                          ${isSelected 
                              ? 'bg-brand-500 text-white shadow-md' 
                              : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }
                          `}
                      >
                          {day}
                      </button>
                      );
                  })}
                  </div>
              )}
            </div>

            {/* Habit Goals Section with Toggle */}
            <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Target size={16} className="text-brand-500" />
                        Habit Goal
                    </label>
                    <button 
                      type="button"
                      onClick={() => setEnableGoal(!enableGoal)}
                      className={`
                        w-12 h-7 rounded-full p-1 transition-all duration-300 relative
                        ${enableGoal ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300
                        ${enableGoal ? 'translate-x-5' : 'translate-x-0'}
                      `} />
                    </button>
                </div>
                
                {enableGoal && (
                  <div className="animate-fade-in space-y-3">
                    <div className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex mb-3">
                        <button 
                          type="button"
                          onClick={() => setGoalType('streak')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${goalType === 'streak' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                          Streak
                        </button>
                        <button 
                          type="button"
                          onClick={() => setGoalType('weekly')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${goalType === 'weekly' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                          Weekly
                        </button>
                        <button 
                          type="button"
                          onClick={() => setGoalType('total')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${goalType === 'total' ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                          Total
                        </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Target Value</span>
                          <div className="flex items-baseline gap-2">
                            <input 
                              type="number" 
                              min="1"
                              max="999"
                              value={goalValue}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setGoalValue(val);
                                if (goalType === 'streak') setTargetStreak(val);
                              }}
                              className="text-3xl font-bold bg-transparent w-24 focus:outline-none text-gray-900 dark:text-white"
                            />
                            <span className="text-sm font-medium text-gray-500">
                                {goalType === 'streak' ? 'days' : goalType === 'weekly' ? 'times / week' : 'check-ins'}
                            </span>
                          </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                            {goalType === 'streak' ? <Flame size={20} /> : goalType === 'weekly' ? <Repeat size={20} /> : <Hash size={20} />}
                        </div>
                    </div>
                    
                    {/* Quick Selectors for Streak (Legacy support visual) */}
                    {goalType === 'streak' && (
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                          {[7, 14, 30, 60, 90].map(d => (
                            <button 
                              key={d}
                              type="button"
                              onClick={() => { setGoalValue(d); setTargetStreak(d); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${goalValue === d ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}
                            >
                              {d} Days
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Optional First Note */}
            <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <BookOpen size={16} className="text-brand-500" />
                    First Journal Entry <span className="text-xs font-normal text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  placeholder="What's your plan? How will you achieve this?"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white transition-all h-24 resize-none text-sm"
                />
            </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          Create Habit <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};