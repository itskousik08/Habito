import React, { useState } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { Moon, Sun, Volume2, VolumeX, Zap, RefreshCw, Archive, ChevronDown, ChevronUp, Reply } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, toggleTheme, toggleSound, toggleAnimations, resetAll, habits, toggleArchive, navigate } = useHabitContext();
  const [showArchived, setShowArchived] = useState(false);

  const archivedHabits = habits.filter(h => h.archived);

  const OptionRow = ({ 
    icon: Icon, 
    label, 
    value, 
    onClick, 
    danger = false 
  }: { 
    icon: any, 
    label: string, 
    value?: boolean, 
    onClick: () => void,
    danger?: boolean
  }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mb-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          <Icon size={20} />
        </div>
        <span className={`font-medium ${danger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
          {label}
        </span>
      </div>
      {value !== undefined && (
        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
      )}
    </button>
  );

  return (
    <div className="pb-24 pt-8 px-6 max-w-md mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Preferences</h3>
        <OptionRow 
          icon={settings.darkMode ? Moon : Sun} 
          label="Dark Mode" 
          value={settings.darkMode} 
          onClick={toggleTheme} 
        />
        <OptionRow 
          icon={settings.soundEnabled ? Volume2 : VolumeX} 
          label="Sound Effects" 
          value={settings.soundEnabled} 
          onClick={toggleSound} 
        />
        <OptionRow 
          icon={Zap} 
          label="Animations" 
          value={settings.animationsEnabled} 
          onClick={toggleAnimations} 
        />
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Archive</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button 
             onClick={() => setShowArchived(!showArchived)}
             className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
             <div className="flex items-center gap-4">
               <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                 <Archive size={20} />
               </div>
               <span className="font-medium text-gray-900 dark:text-white">Archived Habits</span>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500">{archivedHabits.length}</span>
               {showArchived ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
             </div>
          </button>
          
          {showArchived && (
            <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
               {archivedHabits.length === 0 ? (
                 <div className="p-6 text-center text-sm text-gray-400">No archived habits.</div>
               ) : (
                 <div className="divide-y divide-gray-100 dark:divide-gray-700">
                   {archivedHabits.map(h => (
                     <div key={h.id} className="flex items-center justify-between p-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer" 
                          onClick={() => navigate('habit-detail', h.id)}
                        >
                          <span className="text-xl">{h.emoji}</span>
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{h.name}</div>
                            <div className="text-xs text-gray-400">Archived</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleArchive(h.id)}
                          className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <Reply size={16} />
                          <span className="text-xs font-bold">Restore</span>
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Data</h3>
        <OptionRow 
          icon={RefreshCw} 
          label="Reset All Data" 
          onClick={resetAll} 
          danger
        />
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400">HabitFlow v1.1.0</p>
        <p className="text-xs text-gray-300 mt-1">Built with React & Tailwind</p>
      </div>
    </div>
  );
};