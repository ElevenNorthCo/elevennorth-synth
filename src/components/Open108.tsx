import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ChordType = 'major' | 'minor' | 'seventh' | 'diminished';
type RhythmStyle = 'rock' | 'disco' | 'latin' | 'waltz' | 'march' | 'bossanova';
type DrumVoice = 'kick' | 'snare' | 'hat' | 'clap' | 'perc';

interface ChordDef {
  label: string;
  notes: number[];
  type: ChordType;
}

const chordRows: { title: string; type: ChordType; chords: ChordDef[] }[] = [
  {
    title: 'Major',
    type: 'major',
    chords: [
      { label: 'C', notes: [261.63, 329.63, 392.0], type: 'major' },
      { label: 'D', notes: [293.66, 369.99, 440.0], type: 'major' },
      { label: 'E', notes: [329.63, 415.3, 493.88], type: 'major' },
      { label: 'F', notes: [349.23, 440.0, 523.25], type: 'major' },
      { label: 'G', notes: [392.0, 493.88, 587.33], type: 'major' },
      { label: 'A', notes: [440.0, 554.37, 659.25], type: 'major' },
      { label: 'B', notes: [493.88, 622.25, 739.99], type: 'major' },
    ],
  },
  {
    title: 'Minor',
    type: 'minor',
    chords: [
      { label: 'Cm', notes: [261.63, 311.13, 392.0], type: 'minor' },
      { label: 'Dm', notes: [293.66, 349.23, 440.0], type: 'minor' },
      { label: 'Em', notes: [329.63, 392.0, 493.88], type: 'minor' },
      { label: 'Fm', notes: [349.23, 415.3, 523.25], type: 'minor' },
      { label: 'Gm', notes: [392.0, 466.16, 587.33], type: 'minor' },
      { label: 'Am', notes: [440.0, 523.25, 659.25], type: 'minor' },
      { label: 'Bm', notes: [493.88, 587.33, 739.99], type: 'minor' },
    ],
  },
  {
    title: '7th & Dim',
    type: 'seventh',
    chords: [
      { label: 'C7', notes: [261.63, 329.63, 392.0, 466.16], type: 'seventh' },
      { label: 'D7', notes: [293.66, 369.99, 440.0, 523.25], type: 'seventh' },
      { label: 'E7', notes: [329.63, 415.3, 493.88, 587.33], type: 'seventh' },
      { label: 'G7', notes: [392.0, 493.88, 587.33, 698.46], type: 'seventh' },
      { label: 'A7', notes: [440.0, 554.37, 659.25, 783.99], type: 'seventh' },
      { label: 'Bdim', notes: [493.88, 587.33, 698.46], type: 'diminished' },
    ],
  },
];

const rhythmPatterns: Record<RhythmStyle, DrumVoice[][]> = {
  rock:     [['kick','hat'],['hat'],['snare','hat'],['hat'],['kick','hat'],['hat'],['snare','hat'],['hat']],
  disco:    [['kick','hat'],['hat'],['kick','hat'],['hat'],['kick','snare','hat'],['hat'],['kick','hat'],['hat']],
  latin:    [['kick'],['hat'],['snare','perc'],['hat'],['kick','perc'],['hat'],['snare'],['hat']],
  waltz:    [['kick','hat'],['hat'],['snare'],['kick','hat'],['hat'],['snare']],
  march:    [['kick','hat'],['snare','hat'],['kick','hat'],['snare','hat'],['kick'],['snare']],
  bossanova:[['kick','hat'],['perc'],['snare','hat'],['perc'],['kick','hat'],['perc'],['snare','hat'],['clap']],
};

// ── Knob component ──────────────────────────────────────────────
interface KnobProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

const KnobDial: React.FC<KnobProps> = ({ label, value, onChange }) => {
  const startYRef = useRef<number | null>(null);
  const startValRef = useRef(value);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = startYRef.current - e.clientY;
    onChange(Math.min(100, Math.max(0, Math.round(startValRef.current + delta))));
  };

  const handlePointerUp = () => { startYRef.current = null; };

  // -135° = min, +135° = max
  const rotation = (value / 100) * 270 - 135;

  return (
    <div className="dial-wrapper">
      <div
        className="dial"
        style={{ transform: `rotate(${rotation}deg)`, cursor: 'ns-resize', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <span>{label}</span>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────
const Open108: React.FC = () => {
  const [activeChord, setActiveChord] = useState<ChordDef>(chordRows[0].chords[0]);
  const [tempo, setTempo] = useState(102);
  const [rhythmStyle, setRhythmStyle] = useState<RhythmStyle>('rock');
  const [rhythmVolume, setRhythmVolume] = useState(58);
  const [chordVolume, setChordVolume] = useState(72);
  const [isRhythmRunning, setIsRhythmRunning] = useState(false);
  const [isStrumming, setIsStrumming] = useState(false);
  const [isPowered, setIsPowered] = useState(false);

  // Knob state
  const [voices, setVoices] = useState(30);   // detune spread 0-100
  const [tone, setTone] = useState(60);        // filter brightness 0-100
  const [sustain, setSustain] = useState(40);  // note duration 0-100

  // Refs for use inside audio callbacks (avoids stale closures)
  const voicesRef = useRef(voices);
  const sustainRef = useRef(sustain);
  useEffect(() => { voicesRef.current = voices; }, [voices]);
  useEffect(() => { sustainRef.current = sustain; }, [sustain]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const rhythmGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const strumPadRef = useRef<HTMLDivElement | null>(null);
  const lastXRef = useRef<number | null>(null);
  const rhythmStepRef = useRef(0);

  const ensureAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      const context = new window.AudioContext();
      const master = context.createGain();
      const filter = context.createBiquadFilter();
      const compressor = context.createDynamicsCompressor();
      const rhythm = context.createGain();

      filter.type = 'lowpass';
      filter.frequency.value = 800 + (tone / 100) * 7200;
      compressor.threshold.value = -26;
      compressor.ratio.value = 4;
      master.gain.value = chordVolume / 100;
      rhythm.gain.value = rhythmVolume / 100;

      master.connect(filter);
      filter.connect(compressor);
      compressor.connect(context.destination);
      rhythm.connect(filter);

      audioContextRef.current = context;
      masterGainRef.current = master;
      rhythmGainRef.current = rhythm;
      filterRef.current = filter;
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chordVolume, rhythmVolume]);

  // Sync gain nodes when sliders change
  useEffect(() => {
    if (masterGainRef.current) masterGainRef.current.gain.value = chordVolume / 100;
  }, [chordVolume]);

  useEffect(() => {
    if (rhythmGainRef.current) rhythmGainRef.current.gain.value = rhythmVolume / 100;
  }, [rhythmVolume]);

  // Sync filter when tone knob changes
  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.frequency.value = 800 + (tone / 100) * 7200;
    }
  }, [tone]);

  // Power button — initializes audio context and toggles power LED
  const handlePower = useCallback(async () => {
    await ensureAudio();
    setIsPowered((prev) => !prev);
  }, [ensureAudio]);

  const playTone = useCallback(async (frequency: number, strength = 1) => {
    await ensureAudio();
    const context = audioContextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;

    const now = context.currentTime;
    const durationMs = 150 + sustainRef.current * 4; // 150–550 ms
    const detuneRatio = 1 + (voicesRef.current / 100) * 0.015;

    const env = context.createGain();
    const oscA = context.createOscillator();
    const oscB = context.createOscillator();

    oscA.type = 'triangle';
    oscB.type = 'sawtooth';
    oscA.frequency.value = frequency;
    oscB.frequency.value = frequency * detuneRatio;

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.3 * strength, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

    oscA.connect(env);
    oscB.connect(env);
    env.connect(master);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + durationMs / 1000 + 0.06);
    oscB.stop(now + durationMs / 1000 + 0.06);
  }, [ensureAudio]);

  const playDrum = useCallback(async (voice: DrumVoice) => {
    await ensureAudio();
    const context = audioContextRef.current;
    const rhythmGain = rhythmGainRef.current;
    if (!context || !rhythmGain) return;

    const now = context.currentTime;

    if (voice === 'kick') {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(125, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.11);
      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(rhythmGain);
      osc.start(now);
      osc.stop(now + 0.13);
      return;
    }

    const bufferSize = context.sampleRate * 0.08;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) output[i] = Math.random() * 2 - 1;

    const source = context.createBufferSource();
    source.buffer = buffer;
    const noiseFilter = context.createBiquadFilter();
    const gain = context.createGain();

    if (voice === 'snare') {
      noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 1450; gain.gain.value = 0.22;
    } else if (voice === 'clap') {
      noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1200; gain.gain.value = 0.18;
    } else if (voice === 'perc') {
      noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 820; gain.gain.value = 0.16;
    } else {
      noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 6000; gain.gain.value = 0.09;
    }

    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    source.connect(noiseFilter);
    noiseFilter.connect(gain);
    gain.connect(rhythmGain);
    source.start(now);
    source.stop(now + 0.085);
  }, [ensureAudio]);

  // Play a chord's notes in strummed sequence
  const strumChord = useCallback(async (notes: number[], direction: 'left' | 'right', velocity = 0.75) => {
    const ordered = direction === 'right' ? notes : [...notes].reverse();
    await ensureAudio();
    ordered.forEach((note, index) => {
      const delay = Math.max(0, (Math.random() * 10 - 5) + index * 34);
      window.setTimeout(() => void playTone(note, Math.min(1, Math.max(0.45, velocity))), delay);
    });
  }, [ensureAudio, playTone]);

  // Chord button — select + play
  const handleChordClick = useCallback((chord: ChordDef) => {
    setActiveChord(chord);
    void strumChord(chord.notes, 'right', 0.7);
  }, [strumChord]);

  // Rhythm sequencer
  useEffect(() => {
    if (!isRhythmRunning) return undefined;
    const steps = rhythmPatterns[rhythmStyle];
    const stepMs = (60_000 / tempo) / 2;
    const timer = window.setInterval(() => {
      const step = rhythmStepRef.current % steps.length;
      steps[step].forEach((voice) => void playDrum(voice));
      rhythmStepRef.current += 1;
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [isRhythmRunning, rhythmStyle, tempo, playDrum]);

  const flattenedChords = useMemo(() => chordRows.flatMap((row) => row.chords), []);

  // Strum pad handlers
  const handlePadDown = async (x: number) => {
    await ensureAudio();
    setIsStrumming(true);
    lastXRef.current = x;
    void strumChord(activeChord.notes, 'right', 0.7);
  };

  const handlePadMove = (x: number) => {
    if (!isStrumming || lastXRef.current === null) return;
    const delta = x - lastXRef.current;
    if (Math.abs(delta) < 16) return;
    const velocity = Math.min(1, Math.max(0.5, Math.abs(delta) / 80));
    lastXRef.current = x;
    void strumChord(activeChord.notes, delta > 0 ? 'right' : 'left', velocity);
  };

  const stopPadInteraction = () => { setIsStrumming(false); lastXRef.current = null; };

  return (
    <div className="open108-shell">

      {/* ── Top bar ── */}
      <div className="open108-top">
        <div className="knobs-row">
          <KnobDial label="Voices"    value={voices}      onChange={setVoices} />
          <KnobDial label="Tone"      value={tone}        onChange={setTone} />
          <KnobDial label="Sustain"   value={sustain}     onChange={setSustain} />
          <KnobDial label="Chord Vol" value={chordVolume} onChange={setChordVolume} />
        </div>

        <h1 className="brand-title">Open108</h1>

        <div className="transport-panel">
          <button
            className={`transport-btn power-btn${isPowered ? ' powered' : ''}`}
            onClick={() => void handlePower()}
          >
            <span className="led" />
            Power
          </button>
          <button
            className={`transport-btn start-btn${isRhythmRunning ? ' running' : ''}`}
            onClick={() => setIsRhythmRunning((prev) => !prev)}
          >
            <span className="led" />
            {isRhythmRunning ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* ── Main: chords + strum ── */}
      <div className="open108-main">
        <section className="chord-panel">
          {chordRows.map((row) => (
            <div key={row.title} className="chord-row">
              <div className="row-label">{row.title}</div>
              <div className="chord-grid">
                {row.chords.map((chord) => (
                  <button
                    key={chord.label}
                    className={`chord-button ${activeChord.label === chord.label ? 'active' : ''} ${chord.type}`}
                    onClick={() => handleChordClick(chord)}
                  >
                    {chord.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section
          ref={strumPadRef}
          className={`strum-pad${isStrumming ? ' strumming' : ''}`}
          onPointerDown={(e) => void handlePadDown(e.clientX)}
          onPointerMove={(e) => handlePadMove(e.clientX)}
          onPointerUp={stopPadInteraction}
          onPointerLeave={stopPadInteraction}
        >
          <h2>Strum Pad</h2>
          <div className="strum-grid" />
          <p>{activeChord.label} &middot; {flattenedChords.length} chords &middot; swipe to strum</p>
        </section>
      </div>

      {/* ── Bottom: rhythm + mix ── */}
      <div className="open108-bottom">
        <div className="rhythm-section">
          <span className="section-label">Rhythm</span>
          <div className="rhythm-buttons">
            {(['rock', 'disco', 'latin', 'waltz', 'march', 'bossanova'] as RhythmStyle[]).map((style) => (
              <button
                key={style}
                className={rhythmStyle === style ? 'active' : ''}
                onClick={() => setRhythmStyle(style)}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="mix-controls">
          <label>
            <span>Tempo</span>
            <input type="range" min={60} max={160} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} />
            <strong>{tempo}</strong>
          </label>
          <label>
            <span>Rhythm</span>
            <input type="range" min={0} max={100} value={rhythmVolume} onChange={(e) => setRhythmVolume(Number(e.target.value))} />
            <strong>{rhythmVolume}%</strong>
          </label>
          <label>
            <span>Chord</span>
            <input type="range" min={0} max={100} value={chordVolume} onChange={(e) => setChordVolume(Number(e.target.value))} />
            <strong>{chordVolume}%</strong>
          </label>
        </div>
      </div>

    </div>
  );
};

export default Open108;
