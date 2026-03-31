import React from 'react';
import { Home, PlusCircle, BarChart2, Settings } from 'lucide-react';
import { useHabitContext } from '../context/HabitContext.tsx';

export const BottomNav: React.FC = () => {
  const { currentView, navigate } = useHabitContext();

  const navItems = [
    { id: 'today', icon: Home, label: 'Today' },
    { id: 'add', icon: PlusCircle, label: 'Add' },
    { id: 'progress', icon: BarChart2, label: 'Stats' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  if (currentView === 'habit-detail') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe pt-2 px-6 shadow-lg z-50">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200
                ${isActive 
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }
              `}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5' : ''}`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};