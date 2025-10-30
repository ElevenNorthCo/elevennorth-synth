import React, { useEffect, useState } from 'react';
import Synthesizer from './components/Synthesizer';
import { Music } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';

type Theme = 'light' | 'dark';

function App() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('elevennorth-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
      return;
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('elevennorth-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 text-gray-900 transition-colors duration-300 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-end">
          <ThemeToggle theme={theme} onToggle={setTheme} />
        </div>
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-lg font-semibold tracking-wide text-gray-500 md:text-xl dark:text-slate-400">
                ELEVEN NORTH
              </div>
              <h1 className="-mt-1 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl dark:from-slate-100 dark:to-slate-300">
                Synthesizer
              </h1>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-slate-400">
            Professional virtual instrument
          </p>
        </header>
        <Synthesizer />
      </div>
    </div>
  );
}

export default App;