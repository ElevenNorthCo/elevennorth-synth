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
        className="flex items-center justify-between w-48 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all duration-200"
      >
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-800">
            {selectedSoundData.name}
          </div>
          <div className="text-xs text-gray-500">
            {selectedSoundData.description}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.15)] z-50 overflow-hidden">
          {sounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => {
                onSoundChange(sound.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-150 ${
                selectedSound === sound.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="text-sm font-semibold text-gray-800">
                {sound.name}
              </div>
              <div className="text-xs text-gray-500">
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