import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Circle,
  Disc3,
  Download,
  Import,
  Pause,
  Play,
  RotateCcw,
  Square,
} from 'lucide-react';

type InstrumentId = 'lead' | 'bass' | 'pad' | 'keys';

type Envelope = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

type Instrument = {
  id: InstrumentId;
  name: string;
  waveform: OscillatorType;
  baseOctave: number;
};

type DrumPad = {
  id: string;
  label: string;
  baseFrequency: number;
  color: string;
};

const STEPS = 16;
const PITCHES = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
const PITCH_TO_MIDI: Record<string, number> = {
  C5: 72,
  B4: 71,
  A4: 69,
  G4: 67,
  F4: 65,
  E4: 64,
  D4: 62,
  C4: 60,
};

const INSTRUMENTS: Instrument[] = [
  { id: 'lead', name: 'Synth Lead', waveform: 'sawtooth', baseOctave: 5 },
  { id: 'bass', name: 'Bass', waveform: 'square', baseOctave: 3 },
  { id: 'pad', name: 'Pad', waveform: 'triangle', baseOctave: 4 },
  { id: 'keys', name: 'Keys', waveform: 'sine', baseOctave: 4 },
];

const DRUM_PADS: DrumPad[] = [
  { id: 'kick', label: 'Kick', baseFrequency: 78, color: 'from-lime-400 to-lime-500' },
  { id: 'snare', label: 'Snare', baseFrequency: 190, color: 'from-emerald-400 to-emerald-500' },
  { id: 'hat', label: 'Hat', baseFrequency: 320, color: 'from-green-400 to-green-500' },
  { id: 'clap', label: 'Clap', baseFrequency: 250, color: 'from-teal-400 to-teal-500' },
  { id: 'tom', label: 'Tom', baseFrequency: 135, color: 'from-lime-500 to-green-500' },
  { id: 'perc', label: 'Perc', baseFrequency: 220, color: 'from-emerald-500 to-teal-500' },
  { id: 'fx', label: 'FX', baseFrequency: 410, color: 'from-green-500 to-emerald-600' },
  { id: 'openhat', label: 'OpenHat', baseFrequency: 290, color: 'from-teal-500 to-green-600' },
];

const buildEmptyPiano = () => Array.from({ length: PITCHES.length }, () => Array(STEPS).fill(false));
const buildEmptyDrums = () => DRUM_PADS.reduce<Record<string, boolean[]>>((acc, pad) => {
  acc[pad.id] = Array(STEPS).fill(false);
  return acc;
}, {});

const getFrequency = (note: string) => {
  const midi = PITCH_TO_MIDI[note];
  return 440 * (2 ** ((midi - 69) / 12));
};

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(110);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [recordMode, setRecordMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeInstrument, setActiveInstrument] = useState<InstrumentId>('lead');
  const [volume, setVolume] = useState(72);
  const [pan, setPan] = useState(50);
  const [filter, setFilter] = useState(58);
  const [envelope, setEnvelope] = useState<Envelope>({ attack: 0.03, decay: 0.15, sustain: 0.65, release: 0.3 });
  const [pianoRoll, setPianoRoll] = useState<boolean[][]>(buildEmptyPiano);
  const [drumPattern, setDrumPattern] = useState<Record<string, boolean[]>>(buildEmptyDrums);
  const [status, setStatus] = useState('Ready. Tap pads or draw notes.');

  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const padSamplesRef = useRef<Record<string, AudioBuffer | null>>({});

  useEffect(() => {
    stepRef.current = currentStep;
  }, [currentStep]);

  const selectedInstrument = useMemo(
    () => INSTRUMENTS.find((item) => item.id === activeInstrument) ?? INSTRUMENTS[0],
    [activeInstrument],
  );

  const ensureAudioContext = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  };

  const playSynth = async (note: string, duration = 0.2) => {
    const context = await ensureAudioContext();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const biquad = context.createBiquadFilter();
    const stereo = context.createStereoPanner();

    osc.type = selectedInstrument.waveform;
    osc.frequency.setValueAtTime(getFrequency(note), now);

    biquad.type = 'lowpass';
    biquad.frequency.setValueAtTime(300 + filter * 60, now);

    const normalizedVolume = volume / 100;
    const panAmount = (pan - 50) / 50;
    stereo.pan.setValueAtTime(panAmount, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(normalizedVolume * 0.35, now + envelope.attack);
    gain.gain.linearRampToValueAtTime(normalizedVolume * envelope.sustain * 0.35, now + envelope.attack + envelope.decay);
    gain.gain.setValueAtTime(normalizedVolume * envelope.sustain * 0.35, now + Math.max(envelope.attack + envelope.decay, duration));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + envelope.release);

    osc.connect(biquad);
    biquad.connect(gain);
    gain.connect(stereo);
    stereo.connect(context.destination);

    osc.start(now);
    osc.stop(now + duration + envelope.release + 0.02);
  };

  const playMetronome = async (step: number) => {
    if (!metronome) return;
    const context = await ensureAudioContext();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'square';
    osc.frequency.value = step % 4 === 0 ? 1600 : 920;
    gain.gain.value = step % 4 === 0 ? 0.18 : 0.11;
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  };

  const playDrum = async (padId: string) => {
    const context = await ensureAudioContext();
    const now = context.currentTime;
    const sample = padSamplesRef.current[padId];

    if (sample) {
      const source = context.createBufferSource();
      source.buffer = sample;
      const gain = context.createGain();
      gain.gain.value = 0.4;
      source.connect(gain);
      gain.connect(context.destination);
      source.start(now);
      return;
    }

    const pad = DRUM_PADS.find((item) => item.id === padId);
    if (!pad) return;

    const osc = context.createOscillator();
    const gain = context.createGain();
    const noise = context.createOscillator();
    const noiseGain = context.createGain();

    osc.type = padId === 'kick' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(pad.baseFrequency, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(35, pad.baseFrequency / 2), now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    noise.type = 'square';
    noise.frequency.setValueAtTime(6000, now);
    noiseGain.gain.setValueAtTime(padId === 'snare' || padId === 'hat' ? 0.08 : 0.03, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    noise.connect(noiseGain);
    gain.connect(context.destination);
    noiseGain.connect(context.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.2);
    noise.stop(now + 0.08);
  };

  const runStep = async (step: number) => {
    await playMetronome(step);

    pianoRoll.forEach((row, rowIndex) => {
      if (row[step]) {
        playSynth(PITCHES[rowIndex], 0.17);
      }
    });

    DRUM_PADS.forEach((pad) => {
      if (drumPattern[pad.id][step]) {
        playDrum(pad.id);
      }
    });
  };

  const stopTransport = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(0);
    stepRef.current = 0;
  };

  const startTransport = () => {
    if (timerRef.current) return;

    const stepDurationMs = (60 / bpm) * 1000 / 4;
    timerRef.current = window.setInterval(() => {
      const nextStep = (stepRef.current + 1) % STEPS;

      if (!loopEnabled && stepRef.current === STEPS - 1) {
        stopTransport();
        return;
      }

      setCurrentStep(stepRef.current);
      runStep(stepRef.current);
      stepRef.current = nextStep;
    }, stepDurationMs);

    setIsPlaying(true);
    setStatus('Playing loop.');
  };

  useEffect(() => {
    if (isPlaying) {
      stopTransport();
      startTransport();
    }
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

  const togglePianoCell = (row: number, step: number) => {
    setPianoRoll((previous) => previous.map((line, lineIndex) => {
      if (lineIndex !== row) return line;
      return line.map((value, stepIndex) => (stepIndex === step ? !value : value));
    }));
  };

  const toggleDrumStep = (padId: string, step: number) => {
    setDrumPattern((previous) => ({
      ...previous,
      [padId]: previous[padId].map((value, index) => (index === step ? !value : value)),
    }));
  };

  const tapPad = async (padId: string) => {
    await playDrum(padId);
    setStatus(`Pad ${padId.toUpperCase()} triggered.`);

    if (recordMode) {
      setDrumPattern((previous) => ({
        ...previous,
        [padId]: previous[padId].map((value, index) => (index === stepRef.current ? true : value)),
      }));
    }
  };

  const playKey = async (note: string) => {
    await playSynth(note, 0.22);
    if (recordMode) {
      const rowIndex = PITCHES.findIndex((value) => value === note);
      if (rowIndex >= 0) {
        setPianoRoll((previous) => previous.map((line, lineIndex) => (
          lineIndex === rowIndex
            ? line.map((value, index) => (index === stepRef.current ? true : value))
            : line
        )));
      }
    }
  };

  const duplicatePattern = () => {
    setPianoRoll((previous) => previous.map((line) => {
      const firstHalf = line.slice(0, STEPS / 2);
      return [...firstHalf, ...firstHalf];
    }));

    setDrumPattern((previous) => DRUM_PADS.reduce<Record<string, boolean[]>>((acc, pad) => {
      const firstHalf = previous[pad.id].slice(0, STEPS / 2);
      acc[pad.id] = [...firstHalf, ...firstHalf];
      return acc;
    }, {}));

    setStatus('Pattern duplicated from first 8 steps.');
  };

  const exportMidi = () => {
    const header = [77, 84, 104, 100, 0, 0, 0, 6, 0, 0, 0, 1, 0, 96];
    const events: number[] = [];
    const noteLength = 24;

    const pushVarLen = (value: number) => {
      const bytes = [value & 0x7f];
      let remaining = value >> 7;
      while (remaining > 0) {
        bytes.unshift((remaining & 0x7f) | 0x80);
        remaining >>= 7;
      }
      events.push(...bytes);
    };

    const pushNote = (delta: number, note: number, velocity: number, on: boolean, channel = 0) => {
      pushVarLen(delta);
      events.push((on ? 0x90 : 0x80) + channel, note, velocity);
    };

    events.push(0, 0xff, 0x51, 0x03, ...[(60000000 / bpm) >> 16 & 0xff, (60000000 / bpm) >> 8 & 0xff, (60000000 / bpm) & 0xff]);

    let currentTick = 0;
    for (let step = 0; step < STEPS; step += 1) {
      const stepTick = step * noteLength;
      let firstEventForStep = true;

      pianoRoll.forEach((row, rowIndex) => {
        if (row[step]) {
          pushNote(firstEventForStep ? stepTick - currentTick : 0, PITCH_TO_MIDI[PITCHES[rowIndex]], 92, true);
          currentTick = stepTick;
          firstEventForStep = false;
          pushNote(noteLength - 2, PITCH_TO_MIDI[PITCHES[rowIndex]], 0, false);
          currentTick += noteLength - 2;
        }
      });

      DRUM_PADS.forEach((pad, padIndex) => {
        if (drumPattern[pad.id][step]) {
          const note = 36 + padIndex;
          pushNote(firstEventForStep ? stepTick - currentTick : 0, note, 110, true, 9);
          currentTick = stepTick;
          firstEventForStep = false;
          pushNote(4, note, 0, false, 9);
          currentTick += 4;
        }
      });
    }

    events.push(0, 0xff, 0x2f, 0x00);

    const trackLength = events.length;
    const trackHeader = [77, 84, 114, 107, (trackLength >> 24) & 0xff, (trackLength >> 16) & 0xff, (trackLength >> 8) & 0xff, trackLength & 0xff];

    const data = new Uint8Array([...header, ...trackHeader, ...events]);
    const blob = new Blob([data], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'elevennorth-loop.mid';
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus('MIDI exported.');
  };

  const handleWavImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const context = await ensureAudioContext();
    const fileBuffer = await file.arrayBuffer();
    const decoded = await context.decodeAudioData(fileBuffer.slice(0));
    padSamplesRef.current.kick = decoded;
    setStatus(`Loaded ${file.name} into Kick pad.`);
  };

  return (
    <div className="min-h-screen bg-[#050705] text-zinc-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl rounded-2xl border border-lime-400/20 bg-[#0a0f0a] p-4 shadow-[0_0_60px_rgba(40,220,120,0.08)] md:p-6">
        <h1 className="text-2xl font-semibold tracking-wide text-lime-300">ElevenNorth Studio</h1>
        <p className="text-sm text-zinc-400">FL + GarageBand-inspired instant beat workstation.</p>

        <section className="mt-4 grid gap-4 rounded-xl border border-lime-500/20 bg-[#0e140f] p-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-lg bg-lime-400/20 px-3 py-2 text-lime-200" onClick={startTransport}><Play size={16} className="inline" /> Play</button>
            <button className="rounded-lg bg-zinc-700/40 px-3 py-2" onClick={stopTransport}><Square size={16} className="inline" /> Stop</button>
            <button className={`rounded-lg px-3 py-2 ${recordMode ? 'bg-red-500/30 text-red-200' : 'bg-zinc-700/40'}`} onClick={() => setRecordMode((value) => !value)}><Circle size={15} className="inline" /> Rec</button>
            <button className={`rounded-lg px-3 py-2 ${loopEnabled ? 'bg-lime-500/25 text-lime-200' : 'bg-zinc-700/40'}`} onClick={() => setLoopEnabled((value) => !value)}><RotateCcw size={15} className="inline" /> Loop</button>
            <button className={`rounded-lg px-3 py-2 ${metronome ? 'bg-lime-500/25 text-lime-200' : 'bg-zinc-700/40'}`} onClick={() => setMetronome((value) => !value)}><Disc3 size={15} className="inline" /> Metronome</button>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-400">BPM</span>
            <input
              type="range"
              min={70}
              max={160}
              value={bpm}
              onChange={(event) => setBpm(Number(event.target.value))}
            />
            <span className="w-9 text-lime-300">{bpm}</span>
            <span className="rounded bg-black/30 px-2 py-1 text-xs text-zinc-300">Step {currentStep + 1}/{STEPS}</span>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-xl border border-lime-500/15 bg-[#0f1811] p-4">
            <h2 className="text-sm font-semibold text-lime-300">Instrument Rack</h2>
            <div className="mt-3 grid gap-2">
              {INSTRUMENTS.map((instrument) => (
                <button
                  key={instrument.id}
                  className={`rounded-lg border px-2 py-2 text-left text-sm ${activeInstrument === instrument.id ? 'border-lime-400 bg-lime-400/15 text-lime-100' : 'border-zinc-700/50 bg-zinc-800/30 text-zinc-300'}`}
                  onClick={() => setActiveInstrument(instrument.id)}
                >
                  {instrument.name}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 text-xs text-zinc-400">
              <label className="block">Volume {volume}
                <input type="range" min={0} max={100} value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-full" />
              </label>
              <label className="block">Pan {pan - 50}
                <input type="range" min={0} max={100} value={pan} onChange={(event) => setPan(Number(event.target.value))} className="w-full" />
              </label>
              <label className="block">Filter {filter}
                <input type="range" min={10} max={100} value={filter} onChange={(event) => setFilter(Number(event.target.value))} className="w-full" />
              </label>
              <label className="block">Attack
                <input type="range" min={0.01} max={0.2} step={0.01} value={envelope.attack} onChange={(event) => setEnvelope((prev) => ({ ...prev, attack: Number(event.target.value) }))} className="w-full" />
              </label>
            </div>
          </aside>

          <div className="rounded-xl border border-lime-500/15 bg-[#0f1711] p-4">
            <h2 className="text-sm font-semibold text-lime-300">Piano Roll</h2>
            <div className="mt-3 overflow-auto">
              <div className="grid min-w-[760px] grid-cols-[50px_repeat(16,minmax(0,1fr))] gap-[2px]">
                {PITCHES.map((pitch, rowIndex) => (
                  <React.Fragment key={pitch}>
                    <div className="rounded bg-black/35 p-2 text-xs text-zinc-400">{pitch}</div>
                    {Array.from({ length: STEPS }).map((_, step) => (
                      <button
                        key={`${pitch}-${step}`}
                        onClick={() => togglePianoCell(rowIndex, step)}
                        className={`h-8 rounded-sm border text-[10px] ${pianoRoll[rowIndex][step] ? 'border-lime-300 bg-lime-400/70 text-black' : 'border-zinc-800 bg-zinc-900/70 text-zinc-500'} ${currentStep === step && isPlaying ? 'ring-1 ring-lime-300/60' : ''}`}
                      >
                        {step + 1}
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PITCHES.map((note) => (
                <button key={note} onClick={() => playKey(note)} className="rounded-lg bg-zinc-800/60 px-3 py-2 text-xs hover:bg-lime-500/20">{note}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-lime-500/15 bg-[#0f1711] p-4">
            <h2 className="text-sm font-semibold text-lime-300">Pad Drum Machine</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              {DRUM_PADS.map((pad) => (
                <button
                  key={pad.id}
                  onClick={() => tapPad(pad.id)}
                  className={`rounded-xl bg-gradient-to-br p-4 text-left shadow-lg ${pad.color}`}
                >
                  <div className="text-sm font-semibold text-black/90">{pad.label}</div>
                  <div className="mt-1 text-xs text-black/80">Tap / Record</div>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-[80px_repeat(16,minmax(0,1fr))] gap-[2px] overflow-auto text-xs">
              {DRUM_PADS.map((pad) => (
                <React.Fragment key={pad.id}>
                  <div className="rounded bg-black/35 p-2 text-zinc-300">{pad.label}</div>
                  {Array.from({ length: STEPS }).map((_, step) => (
                    <button
                      key={`${pad.id}-${step}`}
                      className={`h-7 rounded-sm border ${drumPattern[pad.id][step] ? 'border-lime-300 bg-lime-300/70' : 'border-zinc-800 bg-zinc-900/70'} ${currentStep === step && isPlaying ? 'ring-1 ring-lime-300/60' : ''}`}
                      onClick={() => toggleDrumStep(pad.id, step)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          <aside className="rounded-xl border border-lime-500/15 bg-[#0f1811] p-4 text-sm">
            <h2 className="font-semibold text-lime-300">Project</h2>
            <div className="mt-3 grid gap-2">
              <button onClick={duplicatePattern} className="rounded-lg bg-zinc-800/70 px-3 py-2 text-left">Duplicate Pattern</button>
              <button onClick={exportMidi} className="rounded-lg bg-lime-500/20 px-3 py-2 text-left text-lime-100"><Download size={15} className="mr-1 inline" /> Export MIDI</button>
              <label className="rounded-lg bg-zinc-800/70 px-3 py-2 text-left cursor-pointer"><Import size={15} className="mr-1 inline" /> Import WAV to Kick
                <input type="file" accept="audio/wav" className="hidden" onChange={handleWavImport} />
              </label>
              <button onClick={() => {
                setPianoRoll(buildEmptyPiano());
                setDrumPattern(buildEmptyDrums());
                setStatus('Cleared project.');
              }} className="rounded-lg bg-zinc-800/70 px-3 py-2 text-left"><Pause size={15} className="mr-1 inline" /> Clear</button>
            </div>
            <p className="mt-4 rounded-lg border border-lime-400/20 bg-black/35 p-3 text-xs text-zinc-300">{status}</p>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default App;
