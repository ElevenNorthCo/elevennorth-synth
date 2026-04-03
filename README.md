# Open108

**A digital recreation of the classic chord-based electronic instrument experience.**

Open108 is an open-source, browser-based instrument inspired by the interaction model and sound character of classic chord-based electronic instruments like the OM-108. Built with React, TypeScript, and the Web Audio API.

> Open108 is an open-source project inspired by classic chord-based electronic instruments. It is not affiliated with or endorsed by Suzuki Musical Instrument Corporation.

## Why This Exists

This project is a cultural preservation effort, a digital accessibility initiative, and a passion project. The goal is to allow anyone to experience chord-button composition and the tonal character of these beloved instruments — right in the browser, no hardware required.

## Live Demo

Hosted on Vercel: [elevennorth-synth.vercel.app](https://elevennorth-synth.vercel.app)

## Features

### Implemented

- **Chromatic Keyboard** — 21 playable keys across 2 octaves (white + sharps), mouse and touch supported
- **Polyphonic Audio Engine** — Custom Web Audio API engine with oscillator layering and ADSR envelopes
- **4 Waveforms** — Sine, Square, Sawtooth, Triangle with distinct tonal characteristics
- **Effects Chain** — Reverb, Echo, Chorus with rotary knob controls
- **Hardware-Inspired UI** — Leather texture, LED indicators, glow accents, decorative screws
- **Dark Mode** — Toggle between light and dark themes
- **Responsive Design** — Works on desktop and mobile with full touch support
- **Keyboard Mapping** — Play with your computer keyboard (mapped across two rows)

### Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Chord selection + strum engine + basic synth | In Progress |
| 2 | Rhythm engine + tempo controls | Planned |
| 3 | PWA install + offline support | Planned |
| 4 | MIDI input/output | Planned |
| 5 | Electron desktop build | Planned |

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Audio:** Web Audio API
- **Hosting:** Vercel (static export)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/ElevenNorthCo/ElevenNorth-Open108.git
cd ElevenNorth-Open108
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory — fully static, no server required.

## Project Structure

```
src/
├── App.tsx                     # Root component
├── main.tsx                    # Entry point
├── index.css                   # Tailwind + custom styles
├── components/
│   ├── Synthesizer.tsx         # Core synth UI & state
│   ├── Open108.tsx             # Open108 instrument component
│   ├── PianoKey.tsx            # Individual key component
│   ├── ControlKnob.tsx         # Rotary effect knob
│   ├── SoundSelector.tsx       # Waveform picker
│   ├── Display.tsx             # LCD-style display
│   └── WaveformVisualizer.tsx  # Audio visualizer (canvas)
└── utils/
    └── AudioEngine.ts          # Web Audio API engine
```

## Architecture

The audio engine is entirely client-side using the Web Audio API. No server-side processing, no external audio libraries, no cloud dependencies.

**Signal Chain:**
```
Oscillator → Gain Envelope → Effects (Reverb/Echo/Chorus) → Master Gain → Output
```

Each waveform has custom ADSR envelopes and harmonic layering to approximate different instrument timbres.

## Contributing

Contributions are welcome! This is an open-source project and we'd love help from anyone interested in digital music, audio programming, or UI/UX design.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [Roadmap](#roadmap) for what's planned next.

## Future Ideas

- Record & export WAV
- Save chord progressions
- Custom rhythm pattern builder
- Alternate voicing modes
- Multi-octave mode
- Strum plate with touch/drag interaction

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Disclaimer

Open108 is:
- Not affiliated with Suzuki Musical Instrument Corporation
- Not endorsed by any hardware manufacturer
- Not a commercial product

It is a tribute, an educational project, a digital preservation effort, and an open-source instrument for the world.

---

Built by [Eleven North](https://elevennorth.co)
