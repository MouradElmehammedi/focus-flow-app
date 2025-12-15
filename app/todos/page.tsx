'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Clock } from 'lucide-react';
import { getTasks, saveTasks, addTask, updateTask, deleteTask } from '@/lib/storage';
import { Task } from '@/types';

export default function TodosPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedTasks = getTasks();
    setTasks(loadedTasks);
    setIsLoading(false);
  }, []);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      completed: false,
      estimatedTime: newTaskTime ? parseInt(newTaskTime) : undefined,
      createdAt: new Date().toISOString(),
    };

    addTask(task);
    setTasks([...tasks, task]);
    setNewTaskTitle('');
    setNewTaskTime('');
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updates: Partial<Task> = {
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : undefined,
    };

    updateTask(taskId, updates);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const totalEstimatedTime = pendingTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">To-Do List</h1>
          <p className="text-sm sm:text-base text-zinc-400">Organize your tasks with time estimates</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{pendingTasks.length}</div>
            <div className="text-xs sm:text-sm text-zinc-400">Pending</div>
          </div>
          <div className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{completedTasks.length}</div>
            <div className="text-xs sm:text-sm text-zinc-400">Completed</div>
          </div>
          <div className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800">
            <div className="text-xl sm:text-2xl font-bold text-purple-500">{totalEstimatedTime}</div>
            <div className="text-xs sm:text-sm text-zinc-400 whitespace-nowrap">Est. Min</div>
          </div>
        </div>

        {/* Add Task Form */}
        <form onSubmit={handleAddTask} className="mb-6 sm:mb-8">
          <div className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 sm:gap-3">
                <input
                  type="number"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  placeholder="Min"
                  min="1"
                  className="w-20 sm:w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Add</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-300">Pending Tasks</h2>
            <div className="space-y-2 sm:space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800 flex items-center gap-3 sm:gap-4 hover:border-zinc-700 transition-colors"
                >
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 rounded-md border-2 border-zinc-600 hover:border-blue-500 flex items-center justify-center transition-colors"
                  >
                    {task.completed && <Check size={14} className="sm:w-4 sm:h-4 text-blue-500" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base break-words">{task.title}</div>
                    {task.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500 mt-1">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        {task.estimatedTime} min
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 sm:p-2 flex-shrink-0 text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-300">Completed</h2>
            <div className="space-y-2 sm:space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800 flex items-center gap-3 sm:gap-4 opacity-60"
                >
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 rounded-md border-2 bg-green-500 border-green-500 flex items-center justify-center"
                  >
                    <Check size={14} className="sm:w-4 sm:h-4 text-white" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base line-through text-zinc-500 break-words">{task.title}</div>
                    {task.estimatedTime && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-600 mt-1">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        {task.estimatedTime} min
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 sm:p-2 flex-shrink-0 text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-16">
            <div className="text-zinc-600 mb-2">No tasks yet</div>
            <div className="text-zinc-500 text-sm">Add your first task to get started</div>
          </div>
        )}
      </div>
    </div>
  );
}
