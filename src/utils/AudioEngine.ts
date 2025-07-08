interface AudioEffects {
  reverb: number;
  echo: number;
  chorus: number;
  volume: number;
}

export class AudioEngine {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private reverbGain: GainNode;
  private echoGain: GainNode;
  private chorusGain: GainNode;
  private activeOscillators: Map<number, { oscillator: OscillatorNode; gain: GainNode }>;
  private waveform: OscillatorType;
  private effects: AudioEffects;

  constructor(waveform: string = 'sine', effects: AudioEffects = { reverb: 0.2, echo: 0.15, chorus: 0.1, volume: 0.7 }) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.waveform = this.getWaveformType(waveform);
    this.effects = effects;
    
    // Create effect nodes
    this.masterGain = this.audioContext.createGain();
    this.reverbGain = this.audioContext.createGain();
    this.echoGain = this.audioContext.createGain();
    this.chorusGain = this.audioContext.createGain();
    
    // Connect effect chain
    this.reverbGain.connect(this.masterGain);
    this.echoGain.connect(this.masterGain);
    this.chorusGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    
    this.updateEffects();
    this.activeOscillators = new Map();
  }

  private getWaveformType(waveform: string): OscillatorType {
    switch (waveform) {
      case 'sine': return 'sine';
      case 'square': return 'square';
      case 'sawtooth': return 'sawtooth';
      case 'triangle': return 'triangle';
      case 'piano': return 'sine';
      case 'organ': return 'square';
      case 'lead': return 'sawtooth';
      case 'pad': return 'triangle';
      case 'bass': return 'sine';
      case 'pluck': return 'square';
      case 'bell': return 'sine';
      case 'strings': return 'sawtooth';
      case 'brass': return 'square';
      case 'choir': return 'triangle';
      case 'arp': return 'square';
      case 'fm': return 'sine';
      default: return 'sine';
    }
  }

  private updateEffects() {
    this.masterGain.gain.value = this.effects.volume * 0.3;
    this.reverbGain.gain.value = this.effects.reverb * 0.5;
    this.echoGain.gain.value = this.effects.echo * 0.3;
    this.chorusGain.gain.value = this.effects.chorus * 0.2;
  }

  private createComplexOscillator(frequency: number): { oscillator: OscillatorNode; gain: GainNode } {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = this.waveform;
    
    // Adjust frequency based on sound type
    let adjustedFrequency = frequency;
    if (this.effects && this.getWaveformString() === 'bass') {
      adjustedFrequency = frequency * 0.5; // Lower octave for bass
    }
    
    oscillator.frequency.setValueAtTime(adjustedFrequency, this.audioContext.currentTime);
    
    // Add harmonics and character based on sound type
    const soundType = this.getWaveformString();
    
    if (['piano', 'bell', 'strings', 'choir', 'fm'].includes(soundType)) {
      const harmonic2 = this.audioContext.createOscillator();
      const harmonic3 = this.audioContext.createOscillator();
      const harmonic2Gain = this.audioContext.createGain();
      const harmonic3Gain = this.audioContext.createGain();
      
      harmonic2.type = 'sine';
      harmonic3.type = 'sine';
      harmonic2.frequency.setValueAtTime(adjustedFrequency * 2, this.audioContext.currentTime);
      harmonic3.frequency.setValueAtTime(adjustedFrequency * 3, this.audioContext.currentTime);
      
      // Different harmonic levels for different sounds
      switch (soundType) {
        case 'piano':
          harmonic2Gain.gain.value = 0.3;
          harmonic3Gain.gain.value = 0.1;
          break;
        case 'bell':
          harmonic2Gain.gain.value = 0.4;
          harmonic3Gain.gain.value = 0.2;
          break;
        case 'strings':
          harmonic2Gain.gain.value = 0.2;
          harmonic3Gain.gain.value = 0.15;
          break;
        case 'choir':
          harmonic2Gain.gain.value = 0.25;
          harmonic3Gain.gain.value = 0.12;
          break;
        case 'fm':
          harmonic2Gain.gain.value = 0.5;
          harmonic3Gain.gain.value = 0.3;
          break;
      }
      
      harmonic2.connect(harmonic2Gain);
      harmonic3.connect(harmonic3Gain);
      harmonic2Gain.connect(gainNode);
      harmonic3Gain.connect(gainNode);
      
      harmonic2.start();
      harmonic3.start();
    }
    
    return { oscillator, gain: gainNode };
  }

  private getWaveformString(): string {
    // Helper to get the original waveform string for sound-specific processing
    return Object.keys({
      sine: 'sine', square: 'square', sawtooth: 'sawtooth', triangle: 'triangle',
      piano: 'piano', organ: 'organ', lead: 'lead', pad: 'pad', bass: 'bass',
      pluck: 'pluck', bell: 'bell', strings: 'strings', brass: 'brass',
      choir: 'choir', arp: 'arp', fm: 'fm'
    }).find(key => this.getWaveformType(key) === this.waveform) || 'sine';
  }

  private async ensureAudioContext() {
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async playNote(frequency: number) {
    await this.ensureAudioContext();
    
    // Stop any existing oscillator for this frequency
    this.stopNote(frequency);
    
    // Create complex oscillator
    const { oscillator, gain: gainNode } = this.createComplexOscillator(frequency);
    
    // Configure envelope (ADSR)
    const now = this.audioContext.currentTime;
    const soundType = this.getWaveformString();
    
    gainNode.gain.setValueAtTime(0, now);
    
    // Different envelopes for different sounds
    switch (soundType) {
      case 'pluck':
      case 'bell':
        gainNode.gain.linearRampToValueAtTime(0.9, now + 0.005); // Fast attack
        gainNode.gain.exponentialRampToValueAtTime(0.1, now + 0.3); // Quick decay
        break;
      case 'pad':
      case 'strings':
      case 'choir':
        gainNode.gain.linearRampToValueAtTime(0.7, now + 0.1); // Slow attack
        gainNode.gain.exponentialRampToValueAtTime(0.5, now + 0.3); // Gentle decay
        gainNode.gain.setValueAtTime(0.5, now + 0.3); // Sustain
        break;
      case 'bass':
        gainNode.gain.linearRampToValueAtTime(0.9, now + 0.02); // Medium attack
        gainNode.gain.exponentialRampToValueAtTime(0.7, now + 0.1); // Short decay
        gainNode.gain.setValueAtTime(0.7, now + 0.1); // High sustain
        break;
      default:
        gainNode.gain.linearRampToValueAtTime(0.8, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.6, now + 0.1); // Decay
        gainNode.gain.setValueAtTime(0.6, now + 0.1); // Sustain
    }
    
    // Connect to effects chain
    oscillator.connect(gainNode);
    
    // Route to different effects
    gainNode.connect(this.masterGain); // Dry signal
    gainNode.connect(this.reverbGain); // Reverb
    gainNode.connect(this.echoGain); // Echo
    gainNode.connect(this.chorusGain); // Chorus
    
    // Start oscillator
    oscillator.start();
    
    // Store reference
    this.activeOscillators.set(frequency, { oscillator, gain: gainNode });
  }

  stopNote(frequency: number) {
    const oscillatorData = this.activeOscillators.get(frequency);
    if (oscillatorData) {
      const { oscillator, gain } = oscillatorData;
      
      // Release envelope
      const now = this.audioContext.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3); // Release
      
      // Stop oscillator after release
      oscillator.stop(now + 0.3);
      
      // Clean up
      this.activeOscillators.delete(frequency);
    }
  }

  cleanup() {
    // Stop all active oscillators
    for (const [frequency] of this.activeOscillators) {
      this.stopNote(frequency);
    }
    
    // Close audio context
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}