import React from 'react';
import { Check, Flame, Zap } from 'lucide-react';
import { Habit } from '../types.ts';
import { formatDateKey, isHabitCompleted, calculateStreak } from '../utils.ts';
import { useHabitContext } from '../context/HabitContext.tsx';

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { toggleCompletion, settings, navigate, toggleNonNegotiable } = useHabitContext();
  const today = new Date();
  const dateKey = formatDateKey(today);
  const isCompleted = isHabitCompleted(habit, dateKey);
  const streak = calculateStreak(habit);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompletion(habit.id, today);
    // Haptic feedback
    if (navigator.vibrate && settings.soundEnabled) { 
       navigator.vibrate(isCompleted ? 10 : 50);
    }
  };

  return (
    <div 
      onClick={() => navigate('habit-detail', habit.id)}
      onContextMenu={(e) => { 
        e.preventDefault(); 
        toggleNonNegotiable(habit.id); 
      }}
      className={`
        relative group overflow-hidden rounded-3xl p-4 mb-3 transition-all duration-300 ease-out transform 
        hover:scale-[1.02] active:scale-[0.98] cursor-pointer
        border
        ${isCompleted 
          ? 'bg-opacity-10 dark:bg-opacity-10 border-transparent' 
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-black/20'
        }
        ${habit.isNonNegotiable ? 'border-brand-500/30' : ''}
      `}
      style={{
        backgroundColor: isCompleted ? `${habit.color}10` : undefined, 
      }}
    >
      {habit.isNonNegotiable && (
        <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
          <Zap size={10} className="text-brand-500 fill-brand-500" />
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Content */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div 
            className={`
              flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl text-2xl shadow-sm transition-colors duration-300
              ${isCompleted ? 'bg-white/40 dark:bg-gray-700/40' : 'bg-gray-50 dark:bg-gray-700/50'}
            `}
          >
            {habit.emoji}
          </div>
          
          <div className="flex flex-col flex-1 min-w-0 py-1">
            <h3 
              className={`
                font-bold text-lg leading-tight truncate transition-all duration-300 
                ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through decoration-2 decoration-gray-300 dark:decoration-gray-600' : 'text-gray-900 dark:text-white'}
              `}
            >
              {habit.name}
            </h3>
            {habit.description && (
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 truncate mt-1.5">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {streak > 0 && !isCompleted && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-full animate-pulse">
              <Flame size={12} className="fill-orange-500" />
              <span>{streak}</span>
            </div>
          )}
          
          <button
            onClick={handleToggle}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
              ${isCompleted 
                ? 'text-white shadow-md scale-100' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-400'
              }
            `}
            style={{
              backgroundColor: isCompleted ? habit.color : undefined,
              boxShadow: isCompleted ? `0 4px 12px ${habit.color}60` : undefined
            }}
          >
             <Check 
               size={22} 
               strokeWidth={3.5} 
               className={`transition-all duration-300 ${isCompleted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} 
             />
             {!isCompleted && <div className="absolute w-3.5 h-3.5 rounded-full border-[2.5px] border-current opacity-40" />}
          </button>
        </div>
      </div>
    </div>
  );
};