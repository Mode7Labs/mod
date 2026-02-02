import React, { useEffect, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export type LFOWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle' | 'sampleHold';
export type SawtoothDirection = 'up' | 'down';

export interface LFOHandle {
  getState: () => {
    frequency: number;
    amplitude: number;
    waveform: LFOWaveform;
    direction: SawtoothDirection;
  };
}

export interface LFORenderProps {
  frequency: number;
  setFrequency: (value: number) => void;
  amplitude: number;
  setAmplitude: (value: number) => void;
  waveform: LFOWaveform;
  setWaveform: (value: LFOWaveform) => void;
  direction: SawtoothDirection;
  setDirection: (value: SawtoothDirection) => void;
  isActive: boolean;
}

export interface LFOProps {
  output: ModStreamRef;
  label?: string;
  // Controlled props
  frequency?: number;
  onFrequencyChange?: (frequency: number) => void;
  amplitude?: number;
  onAmplitudeChange?: (amplitude: number) => void;
  waveform?: LFOWaveform;
  onWaveformChange?: (waveform: LFOWaveform) => void;
  /** Direction for sawtooth waveform: 'up' (rising) or 'down' (falling) */
  direction?: SawtoothDirection;
  onDirectionChange?: (direction: SawtoothDirection) => void;
  // Render props
  children?: (props: LFORenderProps) => ReactNode;
}

export const LFO = React.forwardRef<LFOHandle, LFOProps>(({
  output,
  label = 'lfo',
  frequency: controlledFrequency,
  onFrequencyChange,
  amplitude: controlledAmplitude,
  onAmplitudeChange,
  waveform: controlledWaveform,
  onWaveformChange,
  direction: controlledDirection,
  onDirectionChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [frequency, setFrequency] = useControlledState(controlledFrequency, 1, onFrequencyChange);
  const [amplitude, setAmplitude] = useControlledState(controlledAmplitude, 1, onAmplitudeChange);
  const [waveform, setWaveform] = useControlledState<LFOWaveform>(controlledWaveform, 'sine', onWaveformChange);
  const [direction, setDirection] = useControlledState<SawtoothDirection>(controlledDirection, 'up', onDirectionChange);

  const clampAmplitude = (value: number) => Math.max(0, Math.min(4, value));

  // Regular LFO nodes
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sample & Hold nodes/timer
  const constantRef = useRef<ConstantSourceNode | null>(null);
  const shTimerRef = useRef<number | null>(null);

  // Helper: stop interval safely
  const stopSHTimer = () => {
    if (shTimerRef.current != null) {
      window.clearInterval(shTimerRef.current);
      shTimerRef.current = null;
    }
  };

  // Helper: (re)start sample & hold ticking at current frequency
  const startSHTimer = (ctx: AudioContext, cv: ConstantSourceNode, hz: number) => {
    stopSHTimer();

    const safeHz = Math.max(0.001, hz);
    const intervalMs = Math.max(5, Math.round(1000 / safeHz));

    shTimerRef.current = window.setInterval(() => {
      // random in [-1, 1]
      const v = Math.random() * 2 - 1;
      // schedule slightly ahead to reduce jitter
      const t = ctx.currentTime + 0.01;
      cv.offset.setValueAtTime(v, t);
    }, intervalMs);
  };

  // Create nodes
  useEffect(() => {
    if (!audioContext) return;

    // Standard oscillator LFO
    const oscillator = audioContext.createOscillator();
    oscillator.type = waveform === 'sampleHold' ? 'sine' : waveform;
    oscillator.frequency.value = frequency;
    oscillatorRef.current = oscillator;

    // Gain node (amplitude control) shared by both modes
    const gainNode = audioContext.createGain();
    const safeAmplitude = clampAmplitude(amplitude);
    gainNode.gain.value = (waveform === 'sawtooth' && direction === 'down') ? -safeAmplitude : safeAmplitude;
    gainNodeRef.current = gainNode;

    oscillator.connect(gainNode);
    oscillator.start(0);

    // Sample & Hold LFO (control-rate)
    const cv = audioContext.createConstantSource();
    cv.offset.value = 0;
    constantRef.current = cv;
    cv.connect(gainNode);
    cv.start(0);

    // Disconnect the one we're not using initially
    if (waveform === 'sampleHold') {
      oscillator.disconnect();
      startSHTimer(audioContext, cv, frequency);
    } else {
      cv.disconnect();
    }

    output.current = {
      audioNode: waveform === 'sampleHold' ? cv : oscillator,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

    return () => {
      stopSHTimer();
      oscillator.stop();
      oscillator.disconnect();
      oscillatorRef.current = null;
      cv.stop();
      cv.disconnect();
      constantRef.current = null;
      gainNode.disconnect();
      gainNodeRef.current = null;
      output.current = null;
    };
  }, [audioContext, label]);

  // Update frequency when it changes
  useEffect(() => {
    if (!audioContext) return;

    // Standard oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContext.currentTime);
    }

    // SampleHold: restart interval at new rate
    if (waveform === 'sampleHold' && constantRef.current) {
      startSHTimer(audioContext, constantRef.current, frequency);
    }
  }, [frequency, audioContext, waveform]);

  // Update amplitude when it changes
  useEffect(() => {
    const safeAmplitude = clampAmplitude(amplitude);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = (waveform === 'sawtooth' && direction === 'down') ? -safeAmplitude : safeAmplitude;
    }
  }, [amplitude, waveform, direction]);

  // Update waveform when it changes
  useEffect(() => {
    if (!audioContext || !gainNodeRef.current) return;

    if (waveform === 'sampleHold' && constantRef.current) {
      // Disconnect oscillator, connect constant source
      oscillatorRef.current?.disconnect();
      constantRef.current.connect(gainNodeRef.current);
      output.current = {
        audioNode: constantRef.current,
        gain: gainNodeRef.current,
        context: audioContext,
        metadata: { label, sourceType: 'cv' },
      };
      startSHTimer(audioContext, constantRef.current, frequency);
    } else if (oscillatorRef.current) {
      // Disconnect constant source, connect oscillator
      stopSHTimer();
      constantRef.current?.disconnect();
      oscillatorRef.current.connect(gainNodeRef.current);
      oscillatorRef.current.type = waveform as OscillatorType;
      output.current = {
        audioNode: oscillatorRef.current,
        gain: gainNodeRef.current,
        context: audioContext,
        metadata: { label, sourceType: 'cv' },
      };
    }
  }, [waveform, audioContext, frequency, label]);

  // Update direction for sawtooth
  useEffect(() => {
    if (gainNodeRef.current && waveform === 'sawtooth') {
      const safeAmplitude = clampAmplitude(amplitude);
      gainNodeRef.current.gain.value = direction === 'down' ? -safeAmplitude : safeAmplitude;
    }
  }, [direction, waveform, amplitude]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getState: () => ({ frequency, amplitude, waveform, direction }),
  }), [frequency, amplitude, waveform, direction]);

  // Render children with state
  if (children) {
    return <>{children({
      frequency,
      setFrequency,
      amplitude,
      setAmplitude,
      waveform,
      setWaveform,
      direction,
      setDirection,
      isActive: !!output.current,
    })}</>;
  }

  return null;
});

LFO.displayName = 'LFO';
