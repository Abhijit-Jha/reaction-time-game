// Web Audio API sound effects
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

type SoundType = 'click' | 'trigger' | 'success' | 'early';

const soundConfigs: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; gain: number }> = {
  click: { frequency: 600, duration: 0.05, type: 'sine', gain: 0.1 },
  trigger: { frequency: 880, duration: 0.1, type: 'sine', gain: 0.15 },
  success: { frequency: 523.25, duration: 0.15, type: 'sine', gain: 0.12 },
  early: { frequency: 200, duration: 0.2, type: 'square', gain: 0.08 },
};

export function playSound(type: SoundType): void {
  try {
    const ctx = getAudioContext();
    const config = soundConfigs[type];
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(config.gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
    
    // Play a second note for success sound (chord effect)
    if (type === 'success') {
      const oscillator2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      
      gainNode2.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(ctx.destination);
      
      oscillator2.start(ctx.currentTime + 0.05);
      oscillator2.stop(ctx.currentTime + 0.2);
    }
  } catch (error) {
    // Silently fail if audio is not available
    console.warn('Audio playback failed:', error);
  }
}
