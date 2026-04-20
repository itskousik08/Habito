import React from 'react';
import { HabitProvider, useHabitContext } from './context/HabitContext.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { TodayView } from './views/TodayView.tsx';
import { AddHabitView } from './views/AddHabitView.tsx';
import { ProgressView } from './views/ProgressView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { HabitDetailView } from './views/HabitDetailView.tsx';
import { RoutineView } from './views/RoutineView.tsx';
import { FocusView } from './views/FocusView.tsx';

const AppContent: React.FC = () => {
  const { currentView } = useHabitContext();

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView />;
      case 'add':
        return <AddHabitView />;
      case 'progress':
        return <ProgressView />;
      case 'settings':
        return <SettingsView />;
      case 'habit-detail':
        return <HabitDetailView />;
      case 'routine':
        return <RoutineView />;
      case 'focus':
        return <FocusView />;
      default:
        return <TodayView />;
    }
  };

  const isFullscreen = currentView === 'focus';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-brand-500 selection:text-white">
      <main className={`min-h-screen relative mx-auto w-full md:max-w-md bg-white dark:bg-gray-900 shadow-2xl md:min-h-[800px] md:my-8 md:rounded-[40px] md:overflow-hidden md:border-8 md:border-gray-800 overflow-y-auto ${isFullscreen ? 'md:border-gray-950 bg-gray-950 dark:bg-gray-950' : ''}`}>
        {renderView()}
        {!isFullscreen && <BottomNav />}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
};

export default App;