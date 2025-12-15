"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Clock, TrendingUp, Calendar, Target } from "lucide-react";
import { getFocusSessions, getGoals } from "@/lib/storage";
import { FocusSession, Goal } from "@/types";
import { startOfWeek, endOfWeek, subWeeks, format, parseISO } from "date-fns";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export default function DashboardPage() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadedSessions = getFocusSessions();
    const loadedGoals = getGoals();
    setSessions(loadedSessions);
    setGoals(loadedGoals);
    setIsLoading(false);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const thisWeekSessions = sessions.filter((s) => {
      const date = parseISO(s.date);
      return date >= thisWeekStart && date <= thisWeekEnd;
    });

    const lastWeekSessions = sessions.filter((s) => {
      const date = parseISO(s.date);
      return date >= lastWeekStart && date <= lastWeekEnd;
    });

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const thisWeekMinutes = thisWeekSessions.reduce((sum, s) => sum + s.duration, 0);
    const lastWeekMinutes = lastWeekSessions.reduce((sum, s) => sum + s.duration, 0);

    const avgPerDay = sessions.length > 0 ? Math.round((totalMinutes / 60 / 7) * 10) / 10 : 0;

    const weeklyChange = lastWeekMinutes > 0 ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100) : 0;

    return {
      totalHours,
      totalSessions: sessions.length,
      avgPerDay,
      thisWeekMinutes,
      lastWeekMinutes,
      weeklyChange,
    };
  }, [sessions]);

  const dailyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

    return days.map((day, index) => {
      const date = new Date(thisWeekStart);
      date.setDate(date.getDate() + index);
      const dateStr = format(date, "yyyy-MM-dd");

      const daySessions = sessions.filter((s) => s.date === dateStr);
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);

      return {
        name: day,
        minutes: totalMinutes,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
      };
    });
  }, [sessions]);

  const distributionData = useMemo(() => {
    const timeOfDay: Record<string, number> = {
      "Morning (6-12)": 0,
      "Afternoon (12-18)": 0,
      "Evening (18-24)": 0,
      "Night (0-6)": 0,
    };

    sessions.forEach((session) => {
      const hour = new Date(session.startTime).getHours();
      if (hour >= 6 && hour < 12) timeOfDay["Morning (6-12)"] += session.duration;
      else if (hour >= 12 && hour < 18) timeOfDay["Afternoon (12-18)"] += session.duration;
      else if (hour >= 18 && hour < 24) timeOfDay["Evening (18-24)"] += session.duration;
      else timeOfDay["Night (0-6)"] += session.duration;
    });

    return Object.entries(timeOfDay)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round((value / 60) * 10) / 10,
      }));
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-zinc-400">Track your focus time and productivity trends</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="text-blue-500" size={24} />
              </div>
              <div className="text-sm text-zinc-400">Total Hours</div>
            </div>
            <div className="text-3xl font-bold">{stats.totalHours}</div>
            <div className="text-sm text-zinc-500 mt-1">{stats.totalSessions} sessions</div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="text-green-500" size={24} />
              </div>
              <div className="text-sm text-zinc-400">Daily Average</div>
            </div>
            <div className="text-3xl font-bold">{stats.avgPerDay}h</div>
            <div className="text-sm text-zinc-500 mt-1">per day</div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="text-purple-500" size={24} />
              </div>
              <div className="text-sm text-zinc-400">This Week</div>
            </div>
            <div className="text-3xl font-bold">{Math.round((stats.thisWeekMinutes / 60) * 10) / 10}h</div>
            <div className={`text-sm mt-1 ${stats.weeklyChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {stats.weeklyChange > 0 ? "+" : ""}
              {stats.weeklyChange}% vs last week
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="text-orange-500" size={24} />
              </div>
              <div className="text-sm text-zinc-400">Active Goals</div>
            </div>
            <div className="text-3xl font-bold">{goals.length}</div>
            <div className="text-sm text-zinc-500 mt-1">in progress</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Focus Time */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-6">Daily Focus Time (This Week)</h2>
            {dailyData.some((d) => d.minutes > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" />
                  <YAxis stroke="#71717a" label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#71717a" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                    labelStyle={{ color: "#e4e4e7" }}
                  />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-600">No focus sessions this week</div>
            )}
          </div>

          {/* Time Distribution */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-6">Time Distribution</h2>
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-zinc-600">No data to display</div>
            )}
          </div>
        </div>

        {/* Goals Progress */}
        {goals.length > 0 && (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-xl font-semibold mb-6">Goals Progress</h2>
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = (goal.currentHours / goal.targetHours) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm text-zinc-400">
                        {goal.currentHours}h / {goal.targetHours}h
                      </span>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="bg-zinc-900 rounded-xl p-12 border border-zinc-800 text-center">
            <div className="text-zinc-600 mb-2">No focus sessions yet</div>
            <div className="text-zinc-500 text-sm">Start a focus session from the Timer page to see your analytics</div>
          </div>
        )}
      </div>
    </div>
  );
}
