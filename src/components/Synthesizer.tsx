import React, { useEffect, useRef, useState } from 'react';
import PianoKey from './PianoKey';
import ControlKnob from './ControlKnob';
import SoundSelector from './SoundSelector';
import Display from './Display';
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

const sounds = [
  { id: 'sine', name: 'Classic Sine', description: 'Pure sine wave' },
  { id: 'square', name: 'Digital Square', description: 'Retro 8-bit sound' },
  { id: 'sawtooth', name: 'Sharp Saw', description: 'Bright and buzzy' },
  { id: 'triangle', name: 'Soft Triangle', description: 'Mellow and flute-like' },
];

const Synthesizer: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedSound, setSelectedSound] = useState('sine');
  const [reverb, setReverb] = useState(28);
  const [echo, setEcho] = useState(0);
  const [chorus, setChorus] = useState(18);
  const [volume, setVolume] = useState(76);
  const audioEngineRef = useRef<AudioEngine | null>(null);

  const currentSound = sounds.find(s => s.id === selectedSound) || sounds[0];

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
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-[#1a1a1a] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_60px_rgba(0,0,0,0.8)] md:p-8">
      {/* Chassis Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50 mix-blend-overlay pointer-events-none"></div>

      {/* Screws */}
      <div className="absolute top-4 left-4 h-3 w-3 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center">
        <div className="h-0.5 w-2 bg-[#222] rotate-45"></div>
      </div>
      <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center">
        <div className="h-0.5 w-2 bg-[#222] rotate-45"></div>
      </div>
      <div className="absolute bottom-4 left-4 h-3 w-3 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center">
        <div className="h-0.5 w-2 bg-[#222] rotate-45"></div>
      </div>
      <div className="absolute bottom-4 right-4 h-3 w-3 rounded-full bg-[#111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center">
        <div className="h-0.5 w-2 bg-[#222] rotate-45"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-8">
        {/* Top Section: Branding, Display, Master Volume */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Branding */}
          <div className="flex-shrink-0 text-left">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-300 tracking-wide uppercase">Eleven North</h1>
                <p className="text-sm text-gray-500 font-medium">Synthesizer</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600 font-medium tracking-wider">Professional virtual instrument</p>
          </div>

          {/* Display */}
          <div className="flex-grow w-full md:w-auto">
            <Display title={currentSound.name} subtitle={currentSound.description} />
          </div>

          {/* Master Volume */}
          <div className="flex-shrink-0">
            <ControlKnob
              label="Volume"
              value={volume}
              onChange={setVolume}
              color="blue"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-black shadow-[0_1px_0_rgba(255,255,255,0.1)]"></div>

        {/* Middle Section: Sound Selector & Effects */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="w-full md:w-1/3">
            <SoundSelector selectedSound={selectedSound} onSoundChange={setSelectedSound} />
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <ControlKnob
              label="Reverb"
              value={reverb}
              onChange={setReverb}
              color="orange"
            />
            <ControlKnob
              label="Echo"
              value={echo}
              onChange={setEcho}
              color="orange"
            />
            <ControlKnob
              label="Chorus"
              value={chorus}
              onChange={setChorus}
              color="orange"
            />
          </div>
        </div>

        {/* Bottom Section: Keyboard */}
        <div className="relative mt-4 rounded-xl bg-[#0a0a0a] p-4 shadow-[inset_0_2px_10px_rgba(0,0,0,1)] border-t border-white/5">
          <div className="flex justify-center gap-0.5 overflow-x-auto pb-2">
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

          {/* Black keys container - positioned relative to the white keys container */}
          <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none">
            {/* We need a wrapper to match the white keys width exactly to position black keys correctly */}
            <div className="relative flex gap-0.5 pointer-events-auto">
              {/* Invisible spacers to match white keys layout for positioning */}
              {whiteKeys.map((_, i) => (
                <div key={i} className="w-14 h-0 opacity-0"></div>
              ))}

              {blackKeys.map((mapping, index) => {
                // Calculate position based on the pattern of white keys
                // C D E F G A B
                //  ^ ^   ^ ^ ^
                // 0 1 2 3 4 5 6 (indices of white keys)

                // Black keys are at:
                // C# (between C and D) -> index 0
                // D# (between D and E) -> index 1
                // F# (between F and G) -> index 3
                // G# (between G and A) -> index 4
                // A# (between A and B) -> index 5

                // Second octave
                // C# (between C and D) -> index 7
                // D# (between D and E) -> index 8

                const whiteKeyWidth = 56; // w-14 = 3.5rem = 56px
                const gap = 2; // gap-0.5 = 2px
                const blackKeyWidth = 40; // w-10 = 2.5rem = 40px

                let leftOffset = 0;

                // Manual positioning based on visual preference and music theory
                if (index === 0) leftOffset = (whiteKeyWidth + gap) * 1 - (blackKeyWidth / 2) - (gap / 2); // C#
                if (index === 1) leftOffset = (whiteKeyWidth + gap) * 2 - (blackKeyWidth / 2) - (gap / 2); // D#
                if (index === 2) leftOffset = (whiteKeyWidth + gap) * 4 - (blackKeyWidth / 2) - (gap / 2); // F#
                if (index === 3) leftOffset = (whiteKeyWidth + gap) * 5 - (blackKeyWidth / 2) - (gap / 2); // G#
                if (index === 4) leftOffset = (whiteKeyWidth + gap) * 6 - (blackKeyWidth / 2) - (gap / 2); // A#
                if (index === 5) leftOffset = (whiteKeyWidth + gap) * 8 - (blackKeyWidth / 2) - (gap / 2); // C#
                if (index === 6) leftOffset = (whiteKeyWidth + gap) * 9 - (blackKeyWidth / 2) - (gap / 2); // D#

                return (
                  <PianoKey
                    key={`black-${index}`}
                    note={mapping.note}
                    keyboardKey={mapping.key.toUpperCase()}
                    isActive={activeKeys.has(mapping.key)}
                    type="black"
                    style={{
                      position: 'absolute',
                      left: `${leftOffset}px`,
                    }}
                    onMouseDown={() => playNote(mapping.frequency, mapping.key)}
                    onMouseUp={() => stopNote(mapping.frequency, mapping.key)}
                    onMouseLeave={() => stopNote(mapping.frequency, mapping.key)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Synthesizer;