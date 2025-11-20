import React, { useEffect, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export type LFOWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface LFOHandle {
  getState: () => {
    frequency: number;
    amplitude: number;
    waveform: LFOWaveform;
  };
}

export interface LFORenderProps {
  frequency: number;
  setFrequency: (value: number) => void;
  amplitude: number;
  setAmplitude: (value: number) => void;
  waveform: LFOWaveform;
  setWaveform: (value: LFOWaveform) => void;
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
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [frequency, setFrequency] = useControlledState(controlledFrequency, 1, onFrequencyChange);
  const [amplitude, setAmplitude] = useControlledState(controlledAmplitude, 1, onAmplitudeChange);
  const [waveform, setWaveform] = useControlledState<LFOWaveform>(controlledWaveform, 'sine', onWaveformChange);

  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Create LFO nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create oscillator for LFO
    const oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    oscillatorRef.current = oscillator;

    // Create gain node to control amplitude
    const gainNode = audioContext.createGain();
    gainNode.gain.value = amplitude;
    gainNodeRef.current = gainNode;

    // Connect oscillator to gain
    oscillator.connect(gainNode);

    // Start oscillator
    oscillator.start(0);

    // Set output ref
    output.current = {
      audioNode: oscillator,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

    // Cleanup
    return () => {
      oscillator.stop();
      oscillator.disconnect();
      gainNode.disconnect();
      output.current = null;
      oscillatorRef.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  // Update frequency when it changes
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  // Update amplitude when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = amplitude;
    }
  }, [amplitude]);

  // Update waveform when it changes
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = waveform;
    }
  }, [waveform]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getState: () => ({ frequency, amplitude, waveform }),
  }), [frequency, amplitude, waveform]);

  // Render children with state
  if (children) {
    return <>{children({
      frequency,
      setFrequency,
      amplitude,
      setAmplitude,
      waveform,
      setWaveform,
      isActive: !!output.current,
    })}</>;
  }

  return null;
});

LFO.displayName = 'LFO';
