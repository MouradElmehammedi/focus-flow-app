"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Music } from "lucide-react";
import { CoffeeCup } from "@/components/ui/coffee-cup";
import { addFocusSession } from "@/lib/storage";
import { FocusSession } from "@/types";

const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const DEFAULT_BREAK_TIME = 5 * 60; // 5 minutes in seconds

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  sessionStartTime: string | null;
  lastUpdateTime: number;
}

const TIMER_STORAGE_KEY = "focusflow_timer_state";

export default function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const finishSoundRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    startSoundRef.current = new Audio("/sounds/cute_sound.mp3");
    finishSoundRef.current = new Audio("/sounds/ding_ding_ding_ding.mp3");
    musicRef.current = new Audio("/sounds/music.mp3");

    // Set music to loop
    if (musicRef.current) {
      musicRef.current.loop = true;
    }

    // Cleanup on unmount
    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    };
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedState) {
      try {
        const state: TimerState = JSON.parse(savedState);

        // Calculate elapsed time since last update
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - state.lastUpdateTime) / 1000);

        if (state.isRunning && elapsedSeconds > 0) {
          // Update timeLeft based on elapsed time
          const newTimeLeft = Math.max(0, state.timeLeft - elapsedSeconds);
          setTimeLeft(newTimeLeft);

          if (newTimeLeft === 0) {
            // Timer completed while away
            setIsRunning(false);
          } else {
            setIsRunning(state.isRunning);
          }
        } else {
          setTimeLeft(state.timeLeft);
          setIsRunning(state.isRunning);
        }

        setIsBreak(state.isBreak);
        setSessionStartTime(state.sessionStartTime ? new Date(state.sessionStartTime) : null);
      } catch (e) {
        console.error("Failed to restore timer state:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;

    const state: TimerState = {
      timeLeft,
      isRunning,
      isBreak,
      sessionStartTime: sessionStartTime?.toISOString() || null,
      lastUpdateTime: Date.now(),
    };

    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, [timeLeft, isRunning, isBreak, sessionStartTime, isInitialized]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play finish sound
    if (finishSoundRef.current) {
      finishSoundRef.current.play().catch((e) => console.error("Failed to play finish sound:", e));
    }

    if (!isBreak && sessionStartTime) {
      // Save completed focus session
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 60000);

      const session: FocusSession = {
        id: crypto.randomUUID(),
        startTime: sessionStartTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: durationMinutes,
        date: new Date().toISOString().split("T")[0],
      };

      addFocusSession(session);
    }

    // Auto-switch to break or back to focus
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(DEFAULT_BREAK_TIME);
    } else {
      setIsBreak(false);
      setTimeLeft(DEFAULT_FOCUS_TIME);
    }
  };

  const handleStart = () => {
    if (!isRunning && !isBreak) {
      setSessionStartTime(new Date());
    }
    setIsRunning(true);

    // Play start sound
    if (startSoundRef.current) {
      startSoundRef.current.play().catch((e) => console.error("Failed to play start sound:", e));
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(DEFAULT_FOCUS_TIME);
    setSessionStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Clear saved state on reset
    localStorage.removeItem(TIMER_STORAGE_KEY);
  };

  const handleToggleMusic = (e: React.FormEvent) => {
    e.preventDefault();

    if (!musicRef.current) return;

    if (isMusicPlaying) {
      musicRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      musicRef.current.play().catch((e) => console.error("Failed to play music:", e));
      setIsMusicPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = isBreak
    ? ((DEFAULT_BREAK_TIME - timeLeft) / DEFAULT_BREAK_TIME) * 100
    : ((DEFAULT_FOCUS_TIME - timeLeft) / DEFAULT_FOCUS_TIME) * 100;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center  p-8">
      <div className="max-w-2xl w-full">
        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center gap-8 bg-zinc-900 rounded-3xl p-12 border border-zinc-800">
          {/* Coffee Cup */}
          <div className="justify-center flex items-center">
            <CoffeeCup isActive={isRunning && !isBreak} fillPercent={100 - progress} />
            {/* Progress ring */}
            {/* <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" strokeWidth="3" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isBreak ? "#22c55e" : "#3b82f6"}
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg> */}
          </div>

          {/* Time Display */}
          <div className="text-center">
            <div className="text-7xl font-bold font-mono tracking-wider">{formatTime(timeLeft)}</div>
            {/* <div className="text-sm text-zinc-500 mt-2">{isRunning ? "Session in progress" : "Ready to start"}</div> */}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                <Play size={20} fill="white" />
                Start
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors"
              >
                <Pause size={20} fill="white" />
                Pause
              </button>
            )}

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
            <div className="text-2xl font-bold text-blue-500">25</div>
            <div className="text-sm text-zinc-400">Focus (min)</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
            <div className="text-2xl font-bold text-green-500">5</div>
            <div className="text-sm text-zinc-400">Break (min)</div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 text-center border border-zinc-800">
            <div className="text-2xl font-bold text-purple-500">{Math.floor((DEFAULT_FOCUS_TIME - timeLeft) / 60)}</div>
            <div className="text-sm text-zinc-400">Elapsed (min)</div>
          </div>
        </div>

        {/* Background Music Player */}
        <form onSubmit={handleToggleMusic} className="mt-8">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Music size={24} className={isMusicPlaying ? "text-blue-500" : "text-zinc-500"} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Background Music</h3>
                </div>
              </div>

              <button
                type="submit"
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isMusicPlaying ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isMusicPlaying ? (
                  <>
                    <Pause size={20} fill="white" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={20} fill="white" />
                    Play
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
