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

- **Chord Buttons** — Major, Minor, 7th, and Diminished chords across all keys (C through B)
- **Touch Strum Pad** — Swipe to strum the active chord with velocity-sensitive playback and humanized timing
- **Rhythm Engine** — 6 built-in patterns: Rock, Disco, Latin, Waltz, March, Bossanova
- **Drum Synthesis** — Kick, snare, hi-hat, clap, and percussion voices synthesized via Web Audio API
- **Tempo Control** — Adjustable BPM (60–160) with start/stop transport
- **Volume Mixing** — Independent rhythm and chord volume controls
- **Hardware-Inspired UI** — Cream/beige instrument shell with rounded chassis, dark strum pad, and tactile button styling
- **Responsive Layout** — Landscape-optimized with automatic portrait lock screen for mobile
- **Installable PWA** — Add to home screen on iOS/Android, works fully offline

### Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Chord selection + strum engine + basic synth | Done |
| 2 | Rhythm engine + tempo controls | Done |
| 3 | PWA install + offline support | Done |
| 4 | MIDI input/output | Planned |
| 5 | Electron desktop build | Planned |

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Audio:** Web Audio API (no external audio libraries)
- **PWA:** vite-plugin-pwa + Workbox
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

### Install as PWA

- **iOS Safari:** Navigate to the live demo, tap Share, tap "Add to Home Screen"
- **Android Chrome:** Tap the install banner or use the browser menu
- **Desktop Chrome:** Click the install icon in the address bar

## Project Structure

```
src/
├── App.tsx                     # Root component with landscape lock
├── main.tsx                    # Entry point
├── index.css                   # Tailwind + instrument styles
└── components/
    └── Open108.tsx             # Full instrument: chords, strum, rhythm, audio
```

## Architecture

The entire audio engine is client-side using the Web Audio API. No server-side processing, no external audio libraries, no cloud dependencies. The app makes zero network requests at runtime — all sound is synthesized in real time.

**Chord Engine:**
```
Dual Oscillators (triangle + detuned sawtooth) → Gain Envelope → Master Gain → Lowpass Filter → Compressor → Output
```

**Drum Engine:**
```
Synthesized voices (oscillator kick, noise-based snare/hat/clap/perc) → Rhythm Gain → Lowpass Filter → Compressor → Output
```

Strum interaction applies humanized timing (±5ms randomization) and velocity scaling based on swipe speed.

## Contributing

Contributions are welcome! This is an open-source project and we'd love help from anyone interested in digital music, audio programming, or UI/UX design.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [Roadmap](#roadmap) for what's planned next.

## Future Ideas

- MIDI input/output via Web MIDI API
- Record & export WAV
- Save chord progressions
- Custom rhythm pattern builder
- Alternate voicing modes
- Electron desktop build

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
