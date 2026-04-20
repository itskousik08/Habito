import React, { useState } from 'react';
import { useHabitContext } from '../context/HabitContext.tsx';
import { ArrowLeft, Plus, Trash2, Clock, Check, X } from 'lucide-react';
import { TimeBlock } from '../types.ts';

export const RoutineView: React.FC = () => {
  const { routine, updateRoutine, navigate } = useHabitContext();
  const [isAdding, setIsAdding] = useState(false);
  const [newBlock, setNewBlock] = useState<Partial<TimeBlock>>({
    label: '',
    startTime: '09:00',
    endTime: '10:00',
    isEnabled: true,
    type: 'work'
  });

  const handleAdd = () => {
    if (!newBlock.label) return;
    const block: TimeBlock = {
      id: Math.random().toString(36).substr(2, 9),
      label: newBlock.label,
      startTime: newBlock.startTime || '09:00',
      endTime: newBlock.endTime || '10:00',
      isEnabled: true,
      type: newBlock.type as any || 'work'
    };
    updateRoutine([...routine, block].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setIsAdding(false);
    setNewBlock({ label: '', startTime: '09:00', endTime: '10:00', isEnabled: true, type: 'work' });
  };

  const handleDelete = (id: string) => {
    updateRoutine(routine.filter(b => b.id !== id));
  };

  const toggleBlock = (id: string) => {
    updateRoutine(routine.map(b => b.id === id ? { ...b, isEnabled: !b.isEnabled } : b));
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-md mx-auto animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('today')}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Routine Planner</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-full bg-brand-500 text-white shadow-lg active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      {isAdding && (
        <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-brand-100 dark:border-brand-900 shadow-xl animate-slide-up">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Block Name</label>
              <input 
                type="text" 
                placeholder="e.g. Deep Work, Morning Ritual"
                className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-brand-500 text-sm"
                value={newBlock.label}
                onChange={e => setNewBlock({...newBlock, label: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Start</label>
                <input 
                  type="time" 
                  className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-brand-500 text-sm"
                  value={newBlock.startTime}
                  onChange={e => setNewBlock({...newBlock, startTime: e.target.value})}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">End</label>
                <input 
                  type="time" 
                  className="w-full bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-brand-500 text-sm"
                  value={newBlock.endTime}
                  onChange={e => setNewBlock({...newBlock, endTime: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={handleAdd}
              className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold shadow-lg"
            >
              Add Block
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {routine.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Clock size={48} className="mx-auto mb-4" />
            <p className="font-medium">No routine blocks defined yet.</p>
          </div>
        ) : (
          routine.map(block => (
            <div 
              key={block.id}
              className={`
                p-5 rounded-3xl border transition-all relative group
                ${block.isEnabled 
                  ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm' 
                  : 'bg-gray-50 dark:bg-gray-900 border-transparent opacity-50'
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${block.isEnabled ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{block.label}</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {block.startTime} — {block.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => toggleBlock(block.id)}
                    className={`p-2 rounded-xl transition-colors ${block.isEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-200 text-gray-400'}`}
                  >
                    {block.isEnabled ? <Check size={18} /> : <X size={18} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(block.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
