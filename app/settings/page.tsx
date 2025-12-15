'use client';

import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { getTasks, getHabits, getGoals, getFocusSessions, saveTasks, saveHabits, saveGoals, saveFocusSessions } from '@/lib/storage';

export default function SettingsPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleExportData = () => {
    const data = {
      tasks: getTasks(),
      habits: getHabits(),
      goals: getGoals(),
      sessions: getFocusSessions(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (data.tasks) saveTasks(data.tasks);
        if (data.habits) saveHabits(data.habits);
        if (data.goals) saveGoals(data.goals);
        if (data.sessions) saveFocusSessions(data.sessions);

        alert('Data imported successfully! Please refresh the page.');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    saveTasks([]);
    saveHabits([]);
    saveGoals([]);
    saveFocusSessions([]);

    setClearSuccess(true);
    setShowClearConfirm(false);

    setTimeout(() => {
      setClearSuccess(false);
    }, 3000);
  };

  const getStorageStats = () => {
    const tasks = getTasks();
    const habits = getHabits();
    const goals = getGoals();
    const sessions = getFocusSessions();

    return {
      tasks: tasks.length,
      habits: habits.length,
      goals: goals.length,
      sessions: sessions.length,
    };
  };

  const stats = getStorageStats();

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-zinc-400">Manage your data and preferences</p>
        </div>

        {/* Storage Stats */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-6">
          <h2 className="text-xl font-semibold mb-4">Storage Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{stats.tasks}</div>
              <div className="text-sm text-zinc-400 mt-1">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{stats.habits}</div>
              <div className="text-sm text-zinc-400 mt-1">Habits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">{stats.goals}</div>
              <div className="text-sm text-zinc-400 mt-1">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">{stats.sessions}</div>
              <div className="text-sm text-zinc-400 mt-1">Sessions</div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            {/* Export */}
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div>
                <div className="font-medium mb-1">Export Data</div>
                <div className="text-sm text-zinc-400">
                  Download all your data as a JSON file
                </div>
              </div>
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Download size={18} />
                Export
              </button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div>
                <div className="font-medium mb-1">Import Data</div>
                <div className="text-sm text-zinc-400">
                  Restore data from a backup file
                </div>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
                <Upload size={18} />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>

            {/* Clear All Data */}
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
              <div>
                <div className="font-medium mb-1 text-red-400">Clear All Data</div>
                <div className="text-sm text-zinc-400">
                  Permanently delete all tasks, habits, goals, and sessions
                </div>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Trash2 size={18} />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">About FocusFlow</h2>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>Version: 1.0.0</p>
            <p>Storage: Local Browser Storage</p>
            <p>All data is stored locally on your device</p>
            <p className="text-xs text-zinc-500 mt-4">
              Note: Clearing your browser data will delete all FocusFlow data.
              Export your data regularly to keep backups.
            </p>
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-zinc-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold">Clear All Data?</h3>
              </div>

              <p className="text-zinc-400 mb-6">
                This will permanently delete all your tasks, habits, goals, and focus sessions.
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {clearSuccess && (
          <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
            All data cleared successfully!
          </div>
        )}
      </div>
    </div>
  );
}
