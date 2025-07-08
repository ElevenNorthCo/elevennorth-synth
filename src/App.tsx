import React from 'react';
import Synthesizer from './components/Synthesizer';
import { Music } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <div className="text-lg md:text-xl font-semibold text-gray-500 tracking-wide">
                ELEVEN NORTH
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent -mt-1">
                Synthesizer
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Professional virtual instrument
          </p>
        </header>
        <Synthesizer />
      </div>
    </div>
  );
}

export default App;