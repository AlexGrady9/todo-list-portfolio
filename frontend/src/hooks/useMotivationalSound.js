import { useCallback } from 'react';

// Hook for playing victory sound when tasks are completed
const useMotivationalSound = () => {
  const playSound = useCallback(() => {
    // Creating a chord from C-E-G notes using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Frequencies for major triad (C-E-G)
      const notes = [523.25, 659.25, 783.99]; 
      
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        // Time settings for smooth fade-in/fade-out
        const startTime = audioContext.currentTime + index * 0.1;
        const duration = 0.3;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      // Fallback for cases when browser blocks audio context
      console.log('Audio playback blocked by browser policy'); 
    }
  }, []);

  return { playSound };
};

export default useMotivationalSound;