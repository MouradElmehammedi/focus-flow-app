"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, CheckSquare, Target, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Timer", href: "/timer", icon: Timer },
  { name: "Tasks", href: "/todos", icon: CheckSquare },
  { name: "Habits", href: "/habits", icon: Target },
  { name: "Analytics", href: "/dashboard", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 z-50">
      <nav className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center h-16  ">
          {/* Navigation */}
          <div className="flex items-center justify-between w-full md:justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center gap-0.5 sm:gap-1 px-4 py-2 rounded-lg transition-colors  sm:min-w-20  ",
                    isActive ? "text-blue-500 bg-zinc-800" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  )}
                >
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}

export { Header as Sidebar };
