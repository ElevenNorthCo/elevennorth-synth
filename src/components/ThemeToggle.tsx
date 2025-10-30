import React from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: (nextTheme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  const handleToggle = () => {
    onToggle(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 shadow-[0_4px_16px_rgba(15,23,42,0.08)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(15,23,42,0.12)] dark:border-slate-700/70 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:shadow-[0_6px_20px_rgba(15,23,42,0.35)]"
      aria-label={isDark ? 'Activate light mode' : 'Activate dark mode'}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          className={`absolute h-4 w-4 transition-all duration-200 ${
            isDark ? 'scale-0 opacity-0' : 'scale-100 opacity-100 text-amber-500'
          }`}
        />
        <Moon
          className={`absolute h-4 w-4 transition-all duration-200 ${
            isDark ? 'scale-100 opacity-100 text-indigo-300' : 'scale-0 opacity-0'
          }`}
        />
      </span>
      <span className="hidden sm:inline">{isDark ? 'Dark' : 'Light'} mode</span>
      <span className="inline sm:hidden">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;
