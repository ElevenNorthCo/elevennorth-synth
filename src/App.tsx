import React from 'react';
import Open108 from './components/Open108';

function App() {
  return (
    <main className="app-stage">
      <section className="rotate-lock" aria-hidden="true">
        <div className="phone-icon" />
        <h2>Turn your phone</h2>
        <p>Open108 is designed for landscape performance mode.</p>
      </section>

      <section className="synth-stage">
        <Open108 />
      </section>
    </main>
  );
}

export default App;
