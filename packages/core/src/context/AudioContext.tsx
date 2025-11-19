import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AudioContextValue {
  audioContext: AudioContext | null;
}

const AudioContextContext = createContext<AudioContextValue>({ audioContext: null });

export const useAudioContext = () => {
  const context = useContext(AudioContextContext);
  return context.audioContext;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Create AudioContext on mount
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);

    // Resume context on user interaction (required by browsers)
    const resumeAudio = () => {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          console.log('AudioContext resumed');
        });
      }
    };

    // Add listeners for user interaction
    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);

    return () => {
      // Clean up
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
      if (ctx.state !== 'closed') {
        ctx.close();
      }
    };
  }, []);

  return (
    <AudioContextContext.Provider value={{ audioContext }}>
      {children}
    </AudioContextContext.Provider>
  );
};
