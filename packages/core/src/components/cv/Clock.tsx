import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface ClockRenderProps {
  bpm: number;
  setBpm: (value: number) => void;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export interface ClockProps {
  output: ModStreamRef;
  label?: string;
  bpm?: number;
  children?: (props: ClockRenderProps) => ReactNode;
}

export const Clock: React.FC<ClockProps> = ({
  output,
  label = 'clock',
  bpm: initialBpm = 120,
  children,
}) => {
  const audioContext = useAudioContext();
  const [bpm, setBpm] = useState(initialBpm);
  const [isRunning, setIsRunning] = useState(false);

  const constantSourceRef = useRef<ConstantSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // Create clock output once
  useEffect(() => {
    if (!audioContext) return;

    // Use ConstantSourceNode to output clock pulses as CV
    const constantSource = audioContext.createConstantSource();
    constantSource.offset.value = 0; // Start at 0 (low)
    constantSourceRef.current = constantSource;

    // Create gain node for output
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;
    gainNodeRef.current = gainNode;

    // Connect constant source to gain
    constantSource.connect(gainNode);

    // Start constant source
    constantSource.start(0);

    // Set output ref
    output.current = {
      audioNode: constantSource,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

    // Cleanup
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      constantSource.stop();
      constantSource.disconnect();
      gainNode.disconnect();
      output.current = null;
      constantSourceRef.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  // Start the clock
  const start = () => {
    if (isRunning || !audioContext || !constantSourceRef.current) return;
    setIsRunning(true);

    const pulseInterval = (60 / bpmRef.current) * 1000; // milliseconds per beat

    intervalRef.current = window.setInterval(() => {
      if (!constantSourceRef.current || !audioContext) return;

      const now = audioContext.currentTime;

      // Generate a pulse: 0 -> 1 -> 0
      // Pulse duration is 10ms
      constantSourceRef.current.offset.setValueAtTime(1, now);
      constantSourceRef.current.offset.setValueAtTime(0, now + 0.01);
    }, pulseInterval);
  };

  // Stop the clock
  const stop = () => {
    if (!isRunning) return;
    setIsRunning(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set to 0
    if (constantSourceRef.current && audioContext) {
      constantSourceRef.current.offset.setValueAtTime(0, audioContext.currentTime);
    }
  };

  // Reset the clock (stop and reset position)
  const reset = () => {
    stop();
  };

  // Update interval when BPM changes while running
  useEffect(() => {
    if (isRunning && audioContext) {
      // Clear existing interval
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Restart with new BPM
      const pulseInterval = (60 / bpmRef.current) * 1000;

      intervalRef.current = window.setInterval(() => {
        if (!constantSourceRef.current || !audioContext) return;

        const now = audioContext.currentTime;

        // Generate a pulse
        constantSourceRef.current.offset.setValueAtTime(1, now);
        constantSourceRef.current.offset.setValueAtTime(0, now + 0.01);
      }, pulseInterval);
    }
  }, [bpm]);

  // Render children with state
  if (children) {
    return <>{children({
      bpm,
      setBpm,
      isRunning,
      start,
      stop,
      reset,
    })}</>;
  }

  return null;
};
