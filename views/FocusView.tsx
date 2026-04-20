import React, { useState, useEffect, useRef } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { ArrowLeft, Play, Pause, RotateCcw, Zap } from 'lucide-react';

export const FocusView: React.FC = () => {
  const { habits, navigate, settings } = useHabitContext();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeHabits = habits.filter(h => !h.archived);
  const mainHabit = activeHabits.find(h => h.isNonNegotiable) || activeHabits[0];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
      // Optional: notification or sound
      if (settings.soundEnabled) {
         // Add sound logic if available
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, settings.soundEnabled]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60);
  };

  const setFormatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-8 animate-fade-in">
       {/* Background Glow */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 blur-[120px] rounded-full"></div>
       </div>

      <header className="fixed top-8 left-8">
        <button 
          onClick={() => navigate('today')}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/10"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="text-center relative z-10 w-full max-w-sm">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 text-brand-400 font-bold tracking-widest text-xs uppercase mb-4">
             <Zap size={14} className="fill-brand-400" />
             Discipline Mode
          </div>
          {mainHabit && (
            <h1 className="text-2xl font-bold mb-2">{mainHabit.name}</h1>
          )}
          <p className="text-gray-500 text-sm">Focusing on your non-negotiable</p>
        </div>

        <div className="relative mb-12 flex items-center justify-center">
            {/* Circular Progress would be nice, but simple text for MVP */}
            <div className="text-8xl font-black font-mono tracking-tighter">
              {setFormatTime(timeLeft)}
            </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={resetTimer}
            className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10 text-gray-400"
          >
            <RotateCcw size={24} />
          </button>
          <button 
            onClick={toggleTimer}
            className="w-20 h-20 bg-white text-gray-950 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          <div className="w-12"></div> {/* Spacer for balance if needed */}
        </div>

        <div className="mt-16 flex gap-2">
           <button 
             onClick={() => { setSessionType('work'); setTimeLeft(25 * 60); setIsActive(false); }}
             className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${sessionType === 'work' ? 'bg-brand-500 border-brand-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-transparent border-white/10 text-gray-500'}`}
           >
             Focus
           </button>
           <button 
             onClick={() => { setSessionType('break'); setTimeLeft(5 * 60); setIsActive(false); }}
             className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border transition-all ${sessionType === 'break' ? 'bg-brand-500 border-brand-500' : 'bg-transparent border-white/10 text-gray-500'}`}
           >
             Break
           </button>
        </div>
      </div>
    </div>
  );
};
