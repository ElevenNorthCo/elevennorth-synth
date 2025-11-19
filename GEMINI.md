# Project Overview

This project is a web-based virtual synthesizer built with React, TypeScript, and Vite. It uses the Web Audio API to generate and process audio in real-time. The user interface is built with React and styled with Tailwind CSS.

## Key Technologies

*   **Frontend:** React, TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Audio:** Web Audio API
*   **Icons:** lucide-react

## Architecture

The application is structured into several React components:

*   `App.tsx`: The main application component that renders the synthesizer interface.
*   `Synthesizer.tsx`: The core component that manages the synthesizer's state, handles user input, and interacts with the `AudioEngine`.
*   `PianoKey.tsx`: Renders a single key on the piano keyboard.
*   `WaveformVisualizer.tsx`: Visualizes the audio output.
*   `ControlKnob.tsx`: A reusable knob component for controlling audio parameters.
*   `SoundSelector.tsx`: A component for selecting different sound waveforms.

The audio generation and processing is handled by the `AudioEngine` class in `src/utils/AudioEngine.ts`. This class uses the Web Audio API to create and connect audio nodes, play and stop notes, and apply effects.

# Building and Running

## Development

To run the development server, use the following command:

```bash
npm run dev
```

This will start a Vite development server and open the application in your default browser.

## Building

To build the application for production, use the following command:

```bash
npm run build
```

This will create a `dist` directory with the optimized production build.

## Linting

To lint the codebase, use the following command:

```bash
npm run lint
```

# Development Conventions

## Coding Style

The project uses ESLint to enforce a consistent coding style. The ESLint configuration can be found in `eslint.config.js`.

## Testing

There are no explicit testing practices defined in the project.

**TODO:** Add a testing framework (e.g., Vitest, React Testing Library) and write unit and integration tests for the components and audio engine.
