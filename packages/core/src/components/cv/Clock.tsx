import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';
import { acquireSharedTransport, releaseSharedTransport } from '../../transportRegistry';
import { WorkletTransport } from '../../transportWorklet';
import { TransportBus } from '../../transportBus';

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
  startOutput?: ModStreamRef;
  stopOutput?: ModStreamRef;
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
  startOutput,
  stopOutput,
  label = 'clock',
  bpm: controlledBpm,
  onBpmChange,
  onRunningChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [bpm, setBpm] = useControlledState(controlledBpm, 120, onBpmChange);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkletReady, setIsWorkletReady] = useState(false);

  const clockGainRef = useRef<GainNode | null>(null);
  const startGainRef = useRef<GainNode | null>(null);
  const stopGainRef = useRef<GainNode | null>(null);
  const transportRef = useRef<WorkletTransport | null>(null);
  const transportBusRef = useRef<TransportBus | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  // Create clock output once
  useEffect(() => {
    if (!audioContext) return;

    const clockGain = audioContext.createGain();
    clockGain.gain.value = 1.0;
    clockGainRef.current = clockGain;

    output.current = {
      audioNode: clockGain,
      gain: clockGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

    if (startOutput) {
      const startGain = audioContext.createGain();
      startGain.gain.value = 1.0;
      startGainRef.current = startGain;

      startOutput.current = {
        audioNode: startGain,
        gain: startGain,
        context: audioContext,
        metadata: {
          label: `${label}-start`,
          sourceType: 'cv',
        },
      };
    }

    if (stopOutput) {
      const stopGain = audioContext.createGain();
      stopGain.gain.value = 1.0;
      stopGainRef.current = stopGain;

      stopOutput.current = {
        audioNode: stopGain,
        gain: stopGain,
        context: audioContext,
        metadata: {
          label: `${label}-stop`,
          sourceType: 'cv',
        },
      };
    }

    let cancelled = false;
    acquireSharedTransport(audioContext).then(({ transport, bus }) => {
      if (cancelled) return;
      transportRef.current = transport;
      transportBusRef.current = bus;
      const node = transport.getNode();
      if (node) {
        node.connect(clockGain, 0, 0);
        if (startGainRef.current) {
          node.connect(startGainRef.current, 1, 0);
        }
        if (stopGainRef.current) {
          node.connect(stopGainRef.current, 2, 0);
        }
      }
      output.current = {
        audioNode: clockGain,
        gain: clockGain,
        context: audioContext,
        transport: bus,
        metadata: {
          label,
          sourceType: 'cv',
        },
      };
      workletNodeRef.current = node;
      setIsWorkletReady(true);
    }).catch((err) => {
      console.error('Failed to load transport worklet', err);
    });

    return () => {
      cancelled = true;
      clockGain.disconnect();
      output.current = null;
      clockGainRef.current = null;
      if (workletNodeRef.current) {
        try { workletNodeRef.current.disconnect(); } catch (e) {}
        workletNodeRef.current = null;
      }
      if (startGainRef.current) {
        startGainRef.current.disconnect();
        startGainRef.current = null;
      }
      if (startOutput) {
        startOutput.current = null;
      }
      if (stopGainRef.current) {
        stopGainRef.current.disconnect();
        stopGainRef.current = null;
      }
      if (stopOutput) {
        stopOutput.current = null;
      }
      if (audioContext) {
        releaseSharedTransport(audioContext);
      }
      transportRef.current = null;
      transportBusRef.current = null;
      setIsWorkletReady(false);
    };
  }, [audioContext, label, startOutput, stopOutput]);

  const start = () => {
    if (isRunning || !audioContext || !transportRef.current) return;
    setIsRunning(true);
    transportRef.current.start(audioContext.currentTime);
  };

  const stop = () => {
    if (!isRunning) return;
    setIsRunning(false);
    if (!audioContext || !transportRef.current) return;
    transportRef.current.stop(audioContext.currentTime);
  };

  const reset = () => {
    stop();
  };

  useEffect(() => {
    if (!audioContext || !transportRef.current || !isWorkletReady) return;
    transportRef.current.setTempo(bpm, audioContext.currentTime);
  }, [bpm, audioContext]);


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
