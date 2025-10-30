import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SoundSelectorProps {
  selectedSound: string;
  onSoundChange: (sound: string) => void;
}

const sounds = [
  { id: 'sine', name: 'Classic Sine', description: 'Pure sine wave' },
  { id: 'square', name: 'Square Wave', description: 'Rich harmonics' },
  { id: 'sawtooth', name: 'Sawtooth', description: 'Bright and cutting' },
  { id: 'triangle', name: 'Triangle', description: 'Warm and mellow' },
  { id: 'piano', name: 'Electric Piano', description: 'Vintage keys' },
  { id: 'organ', name: 'Hammond Organ', description: 'Classic organ' },
  { id: 'lead', name: 'Analog Lead', description: 'Cutting lead synth' },
  { id: 'pad', name: 'Warm Pad', description: 'Atmospheric pad' },
  { id: 'bass', name: 'Sub Bass', description: 'Deep bass synth' },
  { id: 'pluck', name: 'Pluck Synth', description: 'Sharp plucked sound' },
  { id: 'bell', name: 'Crystal Bell', description: 'Bright bell tones' },
  { id: 'strings', name: 'Synth Strings', description: 'Lush string ensemble' },
  { id: 'brass', name: 'Synth Brass', description: 'Bold brass section' },
  { id: 'choir', name: 'Vocal Pad', description: 'Ethereal choir' },
  { id: 'arp', name: 'Arpeggiator', description: 'Rhythmic arp sound' },
  { id: 'fm', name: 'FM Electric', description: 'Digital FM synthesis' }
];

const SoundSelector: React.FC<SoundSelectorProps> = ({ selectedSound, onSoundChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedSoundData = sounds.find(s => s.id === selectedSound) || sounds[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-56 items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] focus:outline-none focus:ring-2 focus:ring-blue-400/60 md:w-72 lg:w-80 dark:border-slate-700/60 dark:bg-slate-900/70 dark:shadow-[0_4px_16px_rgba(2,6,23,0.55)] dark:hover:shadow-[0_8px_28px_rgba(2,6,23,0.6)]"
      >
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-800 dark:text-slate-100">
            {selectedSoundData.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-slate-400">
            {selectedSoundData.description}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 dark:text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-gray-200 bg-white/95 shadow-[0_12px_36px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-colors duration-200 touch-pan-y md:max-h-80 dark:border-slate-700/60 dark:bg-slate-900/95 dark:shadow-[0_12px_36px_rgba(2,6,23,0.6)]">
          {sounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => {
                onSoundChange(sound.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-blue-50/80 focus:outline-none focus:ring-2 focus:ring-blue-400/60 dark:hover:bg-slate-800/60 ${
                selectedSound === sound.id
                  ? 'border-l-2 border-blue-500 bg-blue-50/70 dark:border-indigo-400 dark:bg-slate-800/70'
                  : 'border-l-2 border-transparent'
              }`}
            >
              <div className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                {sound.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                {sound.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SoundSelector;