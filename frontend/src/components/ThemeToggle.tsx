"use client";

import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full transition-all duration-300 flex items-center px-1 shadow-lg border"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(39, 39, 42, 0.8)' : 'rgba(229, 231, 235, 0.9)',
        borderColor: theme === 'dark' ? 'rgba(63, 63, 70, 0.5)' : 'rgba(209, 213, 219, 0.8)',
      }}
      aria-label="Toggle theme"
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
        style={{
          transform: theme === 'dark' ? 'translateX(28px)' : 'translateX(0px)',
          backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
        }}
      >
        {theme === 'dark' ? (
          <Moon className="w-3 h-3 text-blue-300" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </div>
    </button>
  );
}