"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getHabits, saveHabits, addHabit, deleteHabit, toggleHabitCompletion } from "@/lib/storage";
import { Habit } from "@/types";
import { startOfWeek, addDays, format, subWeeks, addWeeks, isSameDay } from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitTarget, setNewHabitTarget] = useState("3");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);
    setIsLoading(false);
  }, []);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const habit: Habit = {
      id: crypto.randomUUID(),
      title: newHabitTitle.trim(),
      targetPerWeek: parseInt(newHabitTarget) || 3,
      completions: [],
      createdAt: new Date().toISOString(),
    };

    addHabit(habit);
    setHabits([...habits, habit]);
    setNewHabitTitle("");
    setNewHabitTarget("3");
  };

  const handleDeleteHabit = (habitId: string) => {
    deleteHabit(habitId);
    setHabits(habits.filter((h) => h.id !== habitId));
  };

  const handleToggleDay = (habitId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    toggleHabitCompletion(habitId, dateStr);

    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const updatedHabit = { ...habit };
    const dateIndex = updatedHabit.completions.indexOf(dateStr);

    if (dateIndex > -1) {
      updatedHabit.completions = updatedHabit.completions.filter((d) => d !== dateStr);
    } else {
      updatedHabit.completions = [...updatedHabit.completions, dateStr];
    }

    setHabits(habits.map((h) => (h.id === habitId ? updatedHabit : h)));
  };

  const getWeekDates = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const isDayCompleted = (habit: Habit, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return habit.completions.includes(dateStr);
  };

  const getWeekCompletions = (habit: Habit) => {
    const weekDates = getWeekDates();
    return weekDates.filter((date) => isDayCompleted(habit, date)).length;
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekDates = getWeekDates();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Habit Tracker</h1>
          <p className="text-sm sm:text-base text-zinc-400">Build consistency with weekly frequency goals</p>
        </div>

        {/* Week Navigator */}
        <div className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <button onClick={goToPreviousWeek} className="p-1.5 sm:p-2 text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="text-center">
              <div className="font-semibold text-sm sm:text-base">
                {format(weekDates[0], "MMM d")} - {format(weekDates[6], "MMM d, yyyy")}
              </div>
              {!isCurrentWeek && (
                <button onClick={goToCurrentWeek} className="text-xs sm:text-sm text-blue-500 hover:text-blue-400 mt-1">
                  Go to current week
                </button>
              )}
            </div>

            <button onClick={goToNextWeek} className="p-1.5 sm:p-2 text-zinc-400 hover:text-white transition-colors">
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Add Habit Form */}
        <form onSubmit={handleAddHabit} className="mb-6 sm:mb-8">
          <div className="bg-zinc-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-zinc-800">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="New habit (e.g., Morning Exercise)"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2 sm:gap-3">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <input
                    type="number"
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(e.target.value)}
                    min="1"
                    max="7"
                    className="w-16 sm:w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-zinc-400 text-xs sm:text-sm whitespace-nowrap">/ week</span>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Habits List */}
        {habits.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {habits.map((habit) => {
              const completions = getWeekCompletions(habit);
              const progress = (completions / habit.targetPerWeek) * 100;
              const isComplete = completions >= habit.targetPerWeek;

              return (
                <div key={habit.id} className="bg-zinc-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-zinc-800">
                  <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold mb-1 break-words">{habit.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <span className={isComplete ? "text-green-500" : "text-zinc-400"}>
                          {completions} / {habit.targetPerWeek} completed
                        </span>
                        {isComplete && <span className="text-green-500">✓ Goal reached!</span>}
                      </div>
                    </div>

                    <button onClick={() => handleDeleteHabit(habit.id)} className="p-1.5 sm:p-2 flex-shrink-0 text-zinc-500 hover:text-red-500 transition-colors">
                      <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3 sm:mb-4">
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Weekly Grid */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekDates.map((date, index) => {
                      const completed = isDayCompleted(habit, date);
                      const isToday = isSameDay(date, new Date());
                      const isFuture = date > new Date();

                      return (
                        <button
                          key={index}
                          onClick={() => !isFuture && handleToggleDay(habit.id, date)}
                          disabled={isFuture}
                          className={`
                            aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 sm:gap-1 transition-all
                            ${
                              completed
                                ? "bg-green-500 text-white"
                                : isFuture
                                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            }
                            ${isToday && !completed ? "ring-2 ring-blue-500" : ""}
                          `}
                        >
                          <span className="text-[10px] sm:text-xs font-medium">{DAYS[index]}</span>
                          <span className="text-sm sm:text-lg font-bold">{format(date, "d")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="text-zinc-600 mb-2 text-sm sm:text-base">No habits yet</div>
            <div className="text-zinc-500 text-xs sm:text-sm">Create your first habit to start building consistency</div>
          </div>
        )}
      </div>
    </div>
  );
}
