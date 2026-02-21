# ElevenNorth Studio — Product Requirements Document (PRD)

## Product Name
**ElevenNorth Studio**

## Product Vision
A lightweight web-based music workstation inspired by FL Studio and GarageBand, designed for instant creativity.

**Primary Goal:**
Within 60 seconds, a user can create a looping beat, play instruments, and export their work.

No AI. Pure creative tool.

---

## Core Philosophy
### Speed Over Complexity
- No overwhelming menus
- No DAW bloat
- Immediate sound on interaction

### Visual Identity
- Dark Eleven North theme
- Neon green accents
- Minimal but powerful UI

---

## Target Users
- Hobby beat makers
- Eleven North portfolio visitors
- Producers sketching quick ideas
- Casual users who want instant interaction

---

## MVP Scope

### 1) Transport Bar
- Play
- Stop
- BPM control
- Loop toggle
- Metronome toggle

**Behavior requirements**
- Playback starts immediately.
- Restarting playback should feel responsive with no visible lag.

### 2) Piano Roll
- Click to add/remove notes
- Snap-to-grid editing (16-step)
- Loop-aware playhead feedback
- On-screen keys for auditioning notes
- Record mode writes notes at current step

### 3) Instrument Rack
Fast instrument switching.

**MVP instruments**
- Synth Lead
- Bass
- Pad
- Keys

**Controls**
- Volume
- Pan
- Filter
- ADSR (minimum attack for MVP UI)

### 4) Pad Drum Machine
2x4 responsive pads:
- Kick / Snare / Hat / Clap
- Tom / Perc / FX / OpenHat

**Requirements**
- Tap-to-trigger live playback
- Quantized step recording in Record mode
- Pattern grid editing
- Pattern duplication

### 5) Looping Engine
All tracks sync to:
- Global BPM
- Shared playhead step
- Loop region (16 steps)

### 6) Import / Export
- Export MIDI loop
- Import WAV sample (Kick pad slot in MVP)

---

## Interface Layout
```
--------------------------------------------------
 Transport Bar
--------------------------------------------------
 Track List | Piano Roll
--------------------------------------------------
 Pad Machine | Instrument Controls
--------------------------------------------------
 Mixer / Project Actions
--------------------------------------------------
```

---

## 60-Second User Flow Requirement
- 0s: Click Play and hear the loop
- 5s: Tap drum pads
- 15s: Edit piano roll notes
- 30s: Switch instruments
- 45s: Toggle loop + metronome
- 60s: Export MIDI

---

## Development Roadmap

### Phase 1 — Playable Prototype
Goal: *“It makes sound and loops.”*
- Transport bar
- One sequenced synth lane
- Piano roll grid
- Drum pads + drum sequencer
- Loop playback

### Phase 2 — Studio Feel
- Track list with multiple lanes
- Mixer strips per track
- Presets and saved templates
- Local project persistence

### Phase 3 — Eleven North Identity
- Matrix-style intro motion
- More neon visual polish
- Sliding dock/panel transitions

### Phase 4 — Expansion
- MIDI keyboard input
- Shareable beat links
- Pack system (instrument/sound packs)

---

## Technical Direction
System layers:
1. Audio Engine
2. Sequencer Engine
3. UI Layer
4. Project State

**Core rule:** sequencer timing controls every lane (piano + drums + metronome).

---

## Business Strategy
ElevenNorth Studio becomes:
- A portfolio centerpiece
- A reusable creative-audio engine
- A base for future monetization (packs/themes/add-ons)

MVP remains free.
