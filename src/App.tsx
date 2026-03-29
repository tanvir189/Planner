/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, startOfDay, isSameDay } from 'date-fns';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Check,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TasksByDate {
  [dateKey: string]: Task[];
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [tasks, setTasks] = useState<TasksByDate>(() => {
    const saved = localStorage.getItem('offline-planner-tasks');
    return saved ? JSON.parse(saved) : {};
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('offline-planner-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const currentTasks = useMemo(() => tasks[dateKey] || [], [tasks, dateKey]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTasks(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTask]
    }));
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(task => task.id !== id)
    }));
  };

  const navigateDate = (days: number) => {
    setSelectedDate(prev => addDays(prev, days));
  };

  const goToToday = () => {
    setSelectedDate(startOfDay(new Date()));
  };

  const completedCount = currentTasks.filter(t => t.completed).length;
  const progress = currentTasks.length > 0 ? (completedCount / currentTasks.length) * 100 : 0;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans selection:bg-blue-100",
      darkMode ? "bg-zinc-950 text-zinc-100" : "bg-[#F8F9FA] text-[#1A1A1A]"
    )}>
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-blue-500">
              <CheckCircle2 size={24} />
              <h1 className="text-xl font-bold tracking-tight">Tamim's Todo</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  darkMode ? "bg-zinc-900 text-zinc-400 hover:text-zinc-100" : "bg-white text-gray-400 hover:text-gray-600 border border-gray-100 shadow-sm"
                )}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button 
                onClick={goToToday}
                className={cn(
                  "text-xs font-bold px-4 py-2 rounded-xl transition-all uppercase tracking-wider",
                  isSameDay(selectedDate, new Date()) 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                    : darkMode 
                      ? "bg-zinc-900 text-zinc-400 border border-zinc-800" 
                      : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300"
                )}
              >
                Today
              </button>
            </div>
          </div>

          {/* Date Picker Section */}
          <div className={cn(
            "rounded-3xl p-6 shadow-sm border transition-all mb-6",
            darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-100"
          )}>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigateDate(-1)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  darkMode ? "hover:bg-zinc-800 text-zinc-500" : "hover:bg-gray-50 text-gray-400"
                )}
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">
                  {format(selectedDate, 'MMMM')}
                </span>
                <span className="text-4xl font-black tabular-nums tracking-tighter">
                  {format(selectedDate, 'dd')}
                </span>
                <span className={cn(
                  "text-xs font-bold mt-1 uppercase tracking-widest",
                  darkMode ? "text-zinc-500" : "text-gray-400"
                )}>
                  {format(selectedDate, 'EEEE')}
                </span>
              </div>

              <button 
                onClick={() => navigateDate(1)}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  darkMode ? "hover:bg-zinc-800 text-zinc-500" : "hover:bg-gray-50 text-gray-400"
                )}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {currentTasks.length > 0 && (
            <div className="space-y-3 px-2">
              <div className="flex justify-between text-[10px] font-black text-blue-500 uppercase tracking-[0.15em]">
                <span>Daily Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className={cn(
                "h-2 w-full rounded-full overflow-hidden",
                darkMode ? "bg-zinc-900" : "bg-gray-200"
              )}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          )}
        </header>

        {/* Task Input */}
        <form onSubmit={addTask} className="relative mb-10 group">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What needs to be done?"
            className={cn(
              "w-full rounded-2xl py-5 pl-14 pr-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium",
              darkMode 
                ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-700" 
                : "bg-white border-gray-100 text-zinc-900 placeholder:text-gray-300"
            )}
          />
          <div className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 transition-colors",
            darkMode ? "text-zinc-700 group-focus-within:text-blue-500" : "text-gray-300 group-focus-within:text-blue-500"
          )}>
            <Plus size={24} />
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {currentTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-16 text-gray-300"
              >
                <CalendarIcon size={64} strokeWidth={1} className={cn(
                  "mb-6 opacity-10",
                  darkMode ? "text-zinc-100" : "text-zinc-900"
                )} />
                <p className={cn(
                  "text-sm font-bold uppercase tracking-widest",
                  darkMode ? "text-zinc-700" : "text-gray-300"
                )}>No tasks found</p>
              </motion.div>
            ) : (
              currentTasks
                .sort((a, b) => a.createdAt - b.createdAt)
                .map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group flex items-center gap-5 p-5 rounded-2xl border transition-all",
                    darkMode 
                      ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" 
                      : "bg-white border-gray-100 hover:shadow-lg hover:shadow-gray-200/50",
                    task.completed && "opacity-50"
                  )}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                      task.completed 
                        ? "bg-blue-500 border-blue-500 text-white" 
                        : darkMode 
                          ? "border-zinc-800 hover:border-blue-500" 
                          : "border-gray-200 hover:border-blue-400"
                    )}
                  >
                    {task.completed && <Check size={16} strokeWidth={4} />}
                  </button>
                  
                  <span className={cn(
                    "flex-grow text-[15px] font-semibold transition-all leading-relaxed",
                    task.completed && "line-through text-zinc-500"
                  )}>
                    {task.text}
                  </span>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    className={cn(
                      "opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all",
                      darkMode 
                        ? "text-zinc-700 hover:text-red-400 hover:bg-red-400/10" 
                        : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                    )}
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
