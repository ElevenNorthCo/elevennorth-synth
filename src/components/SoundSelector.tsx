import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SoundSelectorProps {
  selectedSound: string;
  onSoundChange: (sound: string) => void;
}

const sounds = [
  { id: 'sine', name: 'Classic Sine', description: 'Pure sine wave' },
  { id: 'square', name: 'Digital Square', description: 'Retro 8-bit sound' },
  { id: 'sawtooth', name: 'Sharp Saw', description: 'Bright and buzzy' },
  { id: 'triangle', name: 'Soft Triangle', description: 'Mellow and flute-like' },
];

const SoundSelector: React.FC<SoundSelectorProps> = ({ selectedSound, onSoundChange }) => {
  const currentSound = sounds.find(s => s.id === selectedSound) || sounds[0];

  return (
    <div className="relative w-full max-w-xs group">
      <div className="relative overflow-hidden rounded-lg bg-[#1a1a1a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border border-black/50">
        <select
          value={selectedSound}
          onChange={(e) => onSoundChange(e.target.value)}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        >
          {sounds.map((sound) => (
            <option key={sound.id} value={sound.id}>
              {sound.name}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-lg font-semibold text-[#e0e0e0] tracking-wide">
              {currentSound.name}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-1">
              {currentSound.description}
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default SoundSelector;