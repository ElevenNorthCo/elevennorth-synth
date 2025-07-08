import React, { useEffect, useRef, useState } from 'react';
import PianoKey from './PianoKey';
import WaveformVisualizer from './WaveformVisualizer';
import ControlKnob from './ControlKnob';
import SoundSelector from './SoundSelector';
import { AudioEngine } from '../utils/AudioEngine';

interface KeyMapping {
  key: string;
  note: string;
  frequency: number;
  type: 'white' | 'black';
}

const keyMappings: KeyMapping[] = [
  // White keys
  { key: 'a', note: 'C', frequency: 261.63, type: 'white' },
  { key: 's', note: 'D', frequency: 293.66, type: 'white' },
  { key: 'd', note: 'E', frequency: 329.63, type: 'white' },
  { key: 'f', note: 'F', frequency: 349.23, type: 'white' },
  { key: 'g', note: 'G', frequency: 392.00, type: 'white' },
  { key: 'h', note: 'A', frequency: 440.00, type: 'white' },
  { key: 'j', note: 'B', frequency: 493.88, type: 'white' },
  { key: 'k', note: 'C', frequency: 523.25, type: 'white' },
  { key: 'l', note: 'D', frequency: 587.33, type: 'white' },
  { key: ';', note: 'E', frequency: 659.25, type: 'white' },
  { key: "'", note: 'F', frequency: 698.46, type: 'white' },
  // Black keys
  { key: 'w', note: 'C#', frequency: 277.18, type: 'black' },
  { key: 'e', note: 'D#', frequency: 311.13, type: 'black' },
  { key: 't', note: 'F#', frequency: 369.99, type: 'black' },
  { key: 'y', note: 'G#', frequency: 415.30, type: 'black' },
  { key: 'u', note: 'A#', frequency: 466.16, type: 'black' },
  { key: 'o', note: 'C#', frequency: 554.37, type: 'black' },
  { key: 'p', note: 'D#', frequency: 622.25, type: 'black' },
];

const Synthesizer: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedSound, setSelectedSound] = useState('sine');
  const [reverb, setReverb] = useState(20);
  const [echo, setEcho] = useState(15);
  const [chorus, setChorus] = useState(10);
  const [volume, setVolume] = useState(70);
  const audioEngineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine(selectedSound, {
      reverb: reverb / 100,
      echo: echo / 100,
      chorus: chorus / 100,
      volume: volume / 100
    });
    
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
      }
    };
  }, [selectedSound, reverb, echo, chorus, volume]);

  const playNote = (frequency: number, key: string) => {
    if (!audioEngineRef.current) return;
    
    audioEngineRef.current.playNote(frequency);
    setActiveKeys(prev => new Set(prev).add(key));
    setAudioLevel(1);
    
    // Visual feedback timeout
    setTimeout(() => {
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      setAudioLevel(0);
    }, 200);
  };

  const stopNote = (frequency: number, key: string) => {
    if (!audioEngineRef.current) return;
    
    audioEngineRef.current.stopNote(frequency);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mapping = keyMappings.find(m => m.key === key);
      
      if (mapping && !activeKeys.has(key)) {
        event.preventDefault();
        playNote(mapping.frequency, key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mapping = keyMappings.find(m => m.key === key);
      
      if (mapping) {
        event.preventDefault();
        stopNote(mapping.frequency, key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeKeys]);

  const whiteKeys = keyMappings.filter(k => k.type === 'white');
  const blackKeys = keyMappings.filter(k => k.type === 'black');

  return (
    <div className="max-w-6xl mx-auto">
      <WaveformVisualizer audioLevel={audioLevel} />
      
      {/* Control Panel */}
      <div className="my-8 p-6 bg-white/60 backdrop-blur-sm rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-200/50">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SoundSelector selectedSound={selectedSound} onSoundChange={setSelectedSound} />
          
          <div className="flex gap-8">
            <ControlKnob
              label="Volume"
              value={volume}
              onChange={setVolume}
            />
            <ControlKnob
              label="Reverb"
              value={reverb}
              onChange={setReverb}
            />
            <ControlKnob
              label="Echo"
              value={echo}
              onChange={setEcho}
            />
            <ControlKnob
              label="Chorus"
              value={chorus}
              onChange={setChorus}
            />
          </div>
        </div>
      </div>
      
      <div className="relative p-6 bg-white/60 backdrop-blur-sm rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-200/50">
        {/* White keys */}
        <div className="flex justify-center gap-0.5">
          {whiteKeys.map((mapping, index) => (
            <PianoKey
              key={`white-${index}`}
              note={mapping.note}
              keyboardKey={mapping.key.toUpperCase()}
              isActive={activeKeys.has(mapping.key)}
              type="white"
              onMouseDown={() => playNote(mapping.frequency, mapping.key)}
              onMouseUp={() => stopNote(mapping.frequency, mapping.key)}
              onMouseLeave={() => stopNote(mapping.frequency, mapping.key)}
            />
          ))}
        </div>
        
        {/* Black keys */}
        <div className="absolute top-0 left-0 w-full flex justify-center">
          {blackKeys.map((mapping, index) => {
            // Position black keys between white keys
            const positions = [8.8, 17.8, 35.2, 44.2, 53.2, 70.8, 79.8];
            const leftPercent = positions[index] || 0;
            
            return (
              <PianoKey
                key={`black-${index}`}
                note={mapping.note}
                keyboardKey={mapping.key.toUpperCase()}
                isActive={activeKeys.has(mapping.key)}
                type="black"
                style={{ 
                  position: 'absolute',
                  left: `calc(${leftPercent}% + 24px)`,
                  transform: 'translateX(-50%)'
                }}
                onMouseDown={() => playNote(mapping.frequency, mapping.key)}
                onMouseUp={() => stopNote(mapping.frequency, mapping.key)}
                onMouseLeave={() => stopNote(mapping.frequency, mapping.key)}
              />
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm font-medium">
          Use your keyboard: <span className="text-blue-600 font-semibold">A S D F G H J K L ; '</span> for white keys,{' '}
          <span className="text-purple-600 font-semibold">W E T Y U O P</span> for black keys
        </p>
      </div>
    </div>
  );
};

export default Synthesizer;