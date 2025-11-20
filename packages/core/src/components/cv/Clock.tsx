import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface ClockHandle {
  start: () => void;
  stop: () => void;
  reset: () => void;
  getState: () => {
    bpm: number;
    isRunning: boolean;
  };
}

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
  // Controlled props
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  // Event callbacks
  onRunningChange?: (isRunning: boolean) => void;
  // Render props
  children?: (props: ClockRenderProps) => ReactNode;
}

export const Clock = React.forwardRef<ClockHandle, ClockProps>(({
  output,
  label = 'clock',
  bpm: controlledBpm,
  onBpmChange,
  onRunningChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [bpm, setBpm] = useControlledState(controlledBpm, 120, onBpmChange);
  const [isRunning, setIsRunning] = useState(false);

  const constantSourceRef = useRef<ConstantSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // Create clock output once
  useEffect(() => {
    if (!audioContext) return;

    const constantSource = audioContext.createConstantSource();
    constantSource.offset.value = 0;
    constantSourceRef.current = constantSource;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;
    gainNodeRef.current = gainNode;

    constantSource.connect(gainNode);
    constantSource.start(0);

    output.current = {
      audioNode: constantSource,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

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

  const start = () => {
    if (isRunning || !audioContext || !constantSourceRef.current) return;
    setIsRunning(true);

    const pulseInterval = (60 / bpmRef.current) * 1000;

    intervalRef.current = window.setInterval(() => {
      if (!constantSourceRef.current || !audioContext) return;

      const now = audioContext.currentTime;
      constantSourceRef.current.offset.setValueAtTime(1, now);
      constantSourceRef.current.offset.setValueAtTime(0, now + 0.01);
    }, pulseInterval);
  };

  const stop = () => {
    if (!isRunning) return;
    setIsRunning(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (constantSourceRef.current && audioContext) {
      constantSourceRef.current.offset.setValueAtTime(0, audioContext.currentTime);
    }
  };

  const reset = () => {
    stop();
  };

  useEffect(() => {
    if (isRunning && audioContext) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const pulseInterval = (60 / bpmRef.current) * 1000;

      intervalRef.current = window.setInterval(() => {
        if (!constantSourceRef.current || !audioContext) return;

        const now = audioContext.currentTime;
        constantSourceRef.current.offset.setValueAtTime(1, now);
        constantSourceRef.current.offset.setValueAtTime(0, now + 0.01);
      }, pulseInterval);
    }
  }, [bpm]);

  useImperativeHandle(ref, () => ({
    start,
    stop,
    reset,
    getState: () => ({ bpm, isRunning }),
  }), [bpm, isRunning]);

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

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
});

Clock.displayName = 'Clock';
