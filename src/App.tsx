import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Circle, Disc3, Download, Import, Play, RotateCcw, Square, Trash2 } from 'lucide-react';

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
  { id: 'lead', name: 'Synth Lead', waveform: 'sawtooth' },
  { id: 'bass', name: 'Bass', waveform: 'square' },
  { id: 'pad', name: 'Pad', waveform: 'triangle' },
  { id: 'keys', name: 'Keys', waveform: 'sine' },
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

const demoPianoPattern = () => {
  const pattern = Array.from({ length: PITCHES.length }, () => Array(STEPS).fill(false));
  pattern[7][0] = true;
  pattern[7][4] = true;
  pattern[6][8] = true;
  pattern[4][12] = true;
  pattern[5][14] = true;
  return pattern;
};

const demoDrumPattern = () => DRUM_PADS.reduce<Record<string, boolean[]>>((acc, pad) => {
  const steps = Array(STEPS).fill(false);

  if (pad.id === 'kick') {
    steps[0] = true;
    steps[4] = true;
    steps[8] = true;
    steps[12] = true;
  }

  if (pad.id === 'snare') {
    steps[4] = true;
    steps[12] = true;
  }

  if (pad.id === 'hat') {
    for (let index = 0; index < STEPS; index += 2) steps[index] = true;
  }

  acc[pad.id] = steps;
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
  const [volume, setVolume] = useState(78);
  const [pan, setPan] = useState(50);
  const [filter, setFilter] = useState(60);
  const [envelope, setEnvelope] = useState<Envelope>({ attack: 0.02, decay: 0.12, sustain: 0.62, release: 0.25 });
  const [pianoRoll, setPianoRoll] = useState<boolean[][]>(demoPianoPattern);
  const [drumPattern, setDrumPattern] = useState<Record<string, boolean[]>>(demoDrumPattern);
  const [status, setStatus] = useState('Ready. Press Play to hear demo loop.');

  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const padSamplesRef = useRef<Record<string, AudioBuffer | null>>({});

  const selectedInstrument = useMemo(
    () => INSTRUMENTS.find((item) => item.id === activeInstrument) ?? INSTRUMENTS[0],
    [activeInstrument],
  );

  const ensureAudioContext = async () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported in this browser.');
      }
      audioCtxRef.current = new AudioContextClass();
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  };

  const buildOutputNode = (context: AudioContext) => {
    const gain = context.createGain();
    const hasPanner = typeof context.createStereoPanner === 'function';

    if (hasPanner) {
      const stereo = context.createStereoPanner();
      stereo.pan.setValueAtTime((pan - 50) / 50, context.currentTime);
      gain.connect(stereo);
      stereo.connect(context.destination);
      return gain;
    }

    gain.connect(context.destination);
    return gain;
  };

  const playSynth = async (note: string, duration = 0.18) => {
    const context = await ensureAudioContext();
    const now = context.currentTime;

    const oscillator = context.createOscillator();
    oscillator.type = selectedInstrument.waveform;
    oscillator.frequency.setValueAtTime(getFrequency(note), now);

    const filterNode = context.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(450 + filter * 55, now);

    const gain = buildOutputNode(context);
    const normalizedVolume = volume / 100;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(normalizedVolume * 0.35, now + envelope.attack);
    gain.gain.linearRampToValueAtTime(normalizedVolume * envelope.sustain * 0.35, now + envelope.attack + envelope.decay);
    gain.gain.setValueAtTime(normalizedVolume * envelope.sustain * 0.35, now + Math.max(duration, envelope.attack + envelope.decay));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + envelope.release);

    oscillator.connect(filterNode);
    filterNode.connect(gain);

    oscillator.start(now);
    oscillator.stop(now + duration + envelope.release + 0.02);
  };

  const playMetronome = async (step: number) => {
    if (!metronome) return;
    const context = await ensureAudioContext();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = step % 4 === 0 ? 1450 : 940;
    gain.gain.value = step % 4 === 0 ? 0.16 : 0.08;

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.035);
  };

  const playDrum = async (padId: string) => {
    const context = await ensureAudioContext();
    const now = context.currentTime;
    const sample = padSamplesRef.current[padId];

    if (sample) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = sample;
      gain.gain.value = 0.45;
      source.connect(gain);
      gain.connect(context.destination);
      source.start(now);
      return;
    }

    const pad = DRUM_PADS.find((item) => item.id === padId);
    if (!pad) return;

    const oscillator = context.createOscillator();
    const bodyGain = context.createGain();
    const clickOscillator = context.createOscillator();
    const clickGain = context.createGain();

    oscillator.type = padId === 'kick' ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(pad.baseFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, pad.baseFrequency / 2), now + 0.12);

    bodyGain.gain.setValueAtTime(0.35, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    clickOscillator.type = 'square';
    clickOscillator.frequency.setValueAtTime(4500, now);
    clickGain.gain.setValueAtTime(padId === 'snare' || padId === 'hat' || padId === 'openhat' ? 0.08 : 0.025, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    oscillator.connect(bodyGain);
    clickOscillator.connect(clickGain);
    bodyGain.connect(context.destination);
    clickGain.connect(context.destination);

    oscillator.start(now);
    clickOscillator.start(now);
    oscillator.stop(now + 0.2);
    clickOscillator.stop(now + 0.08);
  };

  const runStep = (step: number) => {
    playMetronome(step);

    pianoRoll.forEach((row, rowIndex) => {
      if (row[step]) playSynth(PITCHES[rowIndex], 0.16);
    });

    DRUM_PADS.forEach((pad) => {
      if (drumPattern[pad.id][step]) playDrum(pad.id);
    });
  };

  const stopTransport = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stepRef.current = 0;
    setCurrentStep(0);
    setIsPlaying(false);
    setStatus('Stopped.');
  };

  const startTransport = async () => {
    await ensureAudioContext();

    if (timerRef.current) return;

    const stepDurationMs = (60 / bpm) * 1000 / 4;
    runStep(stepRef.current);
    setCurrentStep(stepRef.current);

    timerRef.current = window.setInterval(() => {
      if (!loopEnabled && stepRef.current === STEPS - 1) {
        stopTransport();
        return;
      }

      stepRef.current = (stepRef.current + 1) % STEPS;
      setCurrentStep(stepRef.current);
      runStep(stepRef.current);
    }, stepDurationMs);

    setIsPlaying(true);
    setStatus('Playing loop.');
  };

  const toggleTransport = () => {
    if (isPlaying) {
      stopTransport();
      return;
    }
    startTransport().catch((error: Error) => {
      setStatus(error.message || 'Unable to initialize audio.');
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    startTransport().catch(() => setStatus('Unable to restart transport.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, loopEnabled]);

  const togglePianoCell = (row: number, step: number) => {
    setPianoRoll((previous) => previous.map((line, lineIndex) => (
      lineIndex === row ? line.map((value, stepIndex) => (stepIndex === step ? !value : value)) : line
    )));
  };

  const toggleDrumStep = (padId: string, step: number) => {
    setDrumPattern((previous) => ({
      ...previous,
      [padId]: previous[padId].map((value, index) => (index === step ? !value : value)),
    }));
  };

  const tapPad = (padId: string) => {
    playDrum(padId).catch(() => setStatus('Audio failed to trigger.'));
    if (recordMode) {
      setDrumPattern((previous) => ({
        ...previous,
        [padId]: previous[padId].map((value, index) => (index === stepRef.current ? true : value)),
      }));
    }
    setStatus(`${padId.toUpperCase()} triggered.`);
  };

  const playKey = (note: string) => {
    playSynth(note, 0.22).catch(() => setStatus('Audio failed to trigger.'));
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

    setStatus('Pattern duplicated (steps 1-8 → 9-16).');
  };

  const resetToDemo = () => {
    stopTransport();
    setPianoRoll(demoPianoPattern());
    setDrumPattern(demoDrumPattern());
    setStatus('Reset to demo loop. Press Play.');
  };

  const clearProject = () => {
    stopTransport();
    setPianoRoll(Array.from({ length: PITCHES.length }, () => Array(STEPS).fill(false)));
    setDrumPattern(DRUM_PADS.reduce<Record<string, boolean[]>>((acc, pad) => {
      acc[pad.id] = Array(STEPS).fill(false);
      return acc;
    }, {}));
    setStatus('Cleared project.');
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
      let first = true;

      pianoRoll.forEach((row, rowIndex) => {
        if (!row[step]) return;
        pushNote(first ? stepTick - currentTick : 0, PITCH_TO_MIDI[PITCHES[rowIndex]], 92, true, 0);
        currentTick = stepTick;
        first = false;
        pushNote(noteLength - 2, PITCH_TO_MIDI[PITCHES[rowIndex]], 0, false, 0);
        currentTick += noteLength - 2;
      });

      DRUM_PADS.forEach((pad, padIndex) => {
        if (!drumPattern[pad.id][step]) return;
        const drumNote = 36 + padIndex;
        pushNote(first ? stepTick - currentTick : 0, drumNote, 112, true, 9);
        currentTick = stepTick;
        first = false;
        pushNote(4, drumNote, 0, false, 9);
        currentTick += 4;
      });
    }

    events.push(0, 0xff, 0x2f, 0x00);

    const trackLength = events.length;
    const trackHeader = [77, 84, 114, 107, (trackLength >> 24) & 0xff, (trackLength >> 16) & 0xff, (trackLength >> 8) & 0xff, trackLength & 0xff];
    const bytes = new Uint8Array([...header, ...trackHeader, ...events]);

    const blob = new Blob([bytes], { type: 'audio/midi' });
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

    try {
      const context = await ensureAudioContext();
      const fileBuffer = await file.arrayBuffer();
      const decoded = await context.decodeAudioData(fileBuffer.slice(0));
      padSamplesRef.current.kick = decoded;
      setStatus(`Imported ${file.name} into Kick.`);
    } catch {
      setStatus('WAV import failed. Use PCM WAV and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050705] text-zinc-100 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl rounded-2xl border border-lime-400/20 bg-[#0a0f0a] p-3 shadow-[0_0_60px_rgba(40,220,120,0.08)] sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-wide text-lime-300">ElevenNorth Studio</h1>
        <p className="text-xs sm:text-sm text-zinc-400">Instant loop creation on desktop + mobile.</p>

        <section className="sticky top-2 z-10 mt-4 grid gap-3 rounded-xl border border-lime-500/20 bg-[#0e140f]/95 p-3 backdrop-blur md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <button className={`rounded-lg px-3 py-3 text-sm ${isPlaying ? 'bg-lime-500/30 text-lime-100' : 'bg-lime-400/20 text-lime-200'}`} onClick={toggleTransport}>{isPlaying ? <><Square size={16} className="inline mr-1" />Stop</> : <><Play size={16} className="inline mr-1" />Play</>}</button>
            <button className={`rounded-lg px-3 py-3 text-sm ${recordMode ? 'bg-red-500/35 text-red-100' : 'bg-zinc-700/50'}`} onClick={() => setRecordMode((value) => !value)}><Circle size={15} className="inline mr-1" />Rec</button>
            <button className={`rounded-lg px-3 py-3 text-sm ${loopEnabled ? 'bg-lime-500/25 text-lime-100' : 'bg-zinc-700/50'}`} onClick={() => setLoopEnabled((value) => !value)}><RotateCcw size={15} className="inline mr-1" />Loop</button>
            <button className={`rounded-lg px-3 py-3 text-sm ${metronome ? 'bg-lime-500/25 text-lime-100' : 'bg-zinc-700/50'}`} onClick={() => setMetronome((value) => !value)}><Disc3 size={15} className="inline mr-1" />Metro</button>
            <button className="rounded-lg bg-zinc-700/50 px-3 py-3 text-sm" onClick={resetToDemo}>Demo</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="text-zinc-400">BPM</span>
            <input type="range" min={70} max={160} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} className="w-28 sm:w-36" />
            <span className="w-10 text-lime-300">{bpm}</span>
            <span className="rounded bg-black/30 px-2 py-1 text-[10px] sm:text-xs text-zinc-300">Step {currentStep + 1}/{STEPS}</span>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-xl border border-lime-500/15 bg-[#0f1811] p-4">
            <h2 className="text-sm font-semibold text-lime-300">Instrument Rack</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
              {INSTRUMENTS.map((instrument) => (
                <button
                  key={instrument.id}
                  className={`rounded-lg border px-3 py-3 text-left text-sm ${activeInstrument === instrument.id ? 'border-lime-400 bg-lime-400/15 text-lime-100' : 'border-zinc-700/50 bg-zinc-800/30 text-zinc-300'}`}
                  onClick={() => setActiveInstrument(instrument.id)}
                >
                  {instrument.name}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3 text-xs text-zinc-400">
              <label className="block">Volume {volume}<input type="range" min={0} max={100} value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="w-full" /></label>
              <label className="block">Pan {pan - 50}<input type="range" min={0} max={100} value={pan} onChange={(event) => setPan(Number(event.target.value))} className="w-full" /></label>
              <label className="block">Filter {filter}<input type="range" min={10} max={100} value={filter} onChange={(event) => setFilter(Number(event.target.value))} className="w-full" /></label>
              <label className="block">Attack {envelope.attack.toFixed(2)}s<input type="range" min={0.01} max={0.2} step={0.01} value={envelope.attack} onChange={(event) => setEnvelope((prev) => ({ ...prev, attack: Number(event.target.value) }))} className="w-full" /></label>
            </div>
          </aside>

          <div className="rounded-xl border border-lime-500/15 bg-[#0f1711] p-4">
            <h2 className="text-sm font-semibold text-lime-300">Piano Roll</h2>
            <div className="mt-3 overflow-auto">
              <div className="grid min-w-[760px] grid-cols-[52px_repeat(16,minmax(0,1fr))] gap-[2px]">
                {PITCHES.map((pitch, rowIndex) => (
                  <React.Fragment key={pitch}>
                    <div className="rounded bg-black/35 p-2 text-xs text-zinc-400">{pitch}</div>
                    {Array.from({ length: STEPS }).map((_, step) => (
                      <button
                        key={`${pitch}-${step}`}
                        onClick={() => togglePianoCell(rowIndex, step)}
                        className={`h-9 rounded-sm border text-[10px] ${pianoRoll[rowIndex][step] ? 'border-lime-300 bg-lime-400/70 text-black' : 'border-zinc-800 bg-zinc-900/70 text-zinc-500'} ${currentStep === step && isPlaying ? 'ring-1 ring-lime-300/70' : ''}`}
                      >
                        {step + 1}
                      </button>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PITCHES.map((note) => (
                <button key={note} onClick={() => playKey(note)} className="rounded-lg bg-zinc-800/60 px-2 py-3 text-xs hover:bg-lime-500/20">{note}</button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_290px]">
          <div className="rounded-xl border border-lime-500/15 bg-[#0f1711] p-4">
            <h2 className="text-sm font-semibold text-lime-300">Pad Drum Machine</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
              {DRUM_PADS.map((pad) => (
                <button key={pad.id} onClick={() => tapPad(pad.id)} className={`rounded-xl bg-gradient-to-br p-4 text-left shadow-lg active:scale-[0.98] ${pad.color}`}>
                  <div className="text-sm font-semibold text-black/90">{pad.label}</div>
                  <div className="mt-1 text-xs text-black/80">Tap / Record</div>
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-auto">
              <div className="grid min-w-[760px] grid-cols-[86px_repeat(16,minmax(0,1fr))] gap-[2px] text-xs">
                {DRUM_PADS.map((pad) => (
                  <React.Fragment key={pad.id}>
                    <div className="rounded bg-black/35 p-2 text-zinc-300">{pad.label}</div>
                    {Array.from({ length: STEPS }).map((_, step) => (
                      <button
                        key={`${pad.id}-${step}`}
                        className={`h-8 rounded-sm border ${drumPattern[pad.id][step] ? 'border-lime-300 bg-lime-300/70' : 'border-zinc-800 bg-zinc-900/70'} ${currentStep === step && isPlaying ? 'ring-1 ring-lime-300/70' : ''}`}
                        onClick={() => toggleDrumStep(pad.id, step)}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-xl border border-lime-500/15 bg-[#0f1811] p-4 text-sm">
            <h2 className="font-semibold text-lime-300">Project</h2>
            <div className="mt-3 grid gap-2">
              <button onClick={duplicatePattern} className="rounded-lg bg-zinc-800/70 px-3 py-3 text-left">Duplicate Pattern</button>
              <button onClick={exportMidi} className="rounded-lg bg-lime-500/20 px-3 py-3 text-left text-lime-100"><Download size={15} className="mr-1 inline" /> Export MIDI</button>
              <label className="rounded-lg bg-zinc-800/70 px-3 py-3 text-left cursor-pointer"><Import size={15} className="mr-1 inline" /> Import WAV to Kick
                <input type="file" accept="audio/wav" className="hidden" onChange={handleWavImport} />
              </label>
              <button onClick={clearProject} className="rounded-lg bg-zinc-800/70 px-3 py-3 text-left"><Trash2 size={15} className="mr-1 inline" /> Clear</button>
            </div>
            <p className="mt-4 rounded-lg border border-lime-400/20 bg-black/35 p-3 text-xs text-zinc-300">{status}</p>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default App;
