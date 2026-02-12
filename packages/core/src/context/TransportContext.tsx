import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAudioContext } from './AudioContext';
import { Transport, TransportOptions } from '../transport';

interface TransportContextValue {
  transport: Transport | null;
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  start: () => void;
  stop: () => void;
  seek: (beat: number) => void;
  setBpm: (bpm: number) => void;
}

const TransportContext = createContext<TransportContextValue>({
  transport: null,
  isPlaying: false,
  bpm: 120,
  currentBeat: 0,
  start: () => {},
  stop: () => {},
  seek: () => {},
  setBpm: () => {},
});

export const useTransport = () => {
  return useContext(TransportContext);
};

export interface TransportProviderProps extends TransportOptions {
  children: ReactNode;
}

export const TransportProvider: React.FC<TransportProviderProps> = ({
  children,
  bpm: initialBpm = 120,
  startBeat = 0,
}) => {
  const audioContext = useAudioContext();
  const [transport, setTransport] = useState<Transport | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(initialBpm);
  const [currentBeat, setCurrentBeat] = useState(startBeat);

  // Create transport when audio context is available
  useEffect(() => {
    if (!audioContext) return;

    const t = new Transport(audioContext, { bpm: initialBpm, startBeat });
    setTransport(t);

    // Subscribe to transport events
    const offStart = t.on('start', () => setIsPlaying(true));
    const offStop = t.on('stop', () => setIsPlaying(false));
    const offTempo = t.on('tempo', () => setBpmState(t.bpm));
    const offSeek = t.on('seek', () => setCurrentBeat(t.currentBeat));

    // Update current beat periodically while playing
    let frameId: number;
    const updateBeat = () => {
      if (t.isPlaying) {
        setCurrentBeat(t.currentBeat);
      }
      frameId = requestAnimationFrame(updateBeat);
    };
    frameId = requestAnimationFrame(updateBeat);

    return () => {
      offStart();
      offStop();
      offTempo();
      offSeek();
      cancelAnimationFrame(frameId);
    };
  }, [audioContext, initialBpm, startBeat]);

  const start = useCallback(() => {
    transport?.start();
  }, [transport]);

  const stop = useCallback(() => {
    transport?.stop();
  }, [transport]);

  const seek = useCallback((beat: number) => {
    transport?.seek(beat);
  }, [transport]);

  const setBpm = useCallback((newBpm: number) => {
    transport?.setTempo(newBpm);
  }, [transport]);

  return (
    <TransportContext.Provider
      value={{
        transport,
        isPlaying,
        bpm,
        currentBeat,
        start,
        stop,
        seek,
        setBpm,
      }}
    >
      {children}
    </TransportContext.Provider>
  );
};
