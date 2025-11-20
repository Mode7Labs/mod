import React, { useEffect, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface ToneGeneratorHandle {
  getState: () => {
    frequency: number;
    gain: number;
    waveform: OscillatorType;
  };
}

export interface ToneGeneratorRenderProps {
  frequency: number;
  setFrequency: (value: number) => void;
  gain: number;
  setGain: (value: number) => void;
  waveform: OscillatorType;
  setWaveform: (type: OscillatorType) => void;
  isActive: boolean;
}

export interface ToneGeneratorProps {
  output: ModStreamRef;
  label?: string;
  // Controlled props
  frequency?: number;
  onFrequencyChange?: (frequency: number) => void;
  gain?: number;
  onGainChange?: (gain: number) => void;
  waveform?: OscillatorType;
  onWaveformChange?: (waveform: OscillatorType) => void;
  // CV inputs
  cv?: ModStreamRef;
  cvAmount?: number;
  // Render props
  children?: (props: ToneGeneratorRenderProps) => ReactNode;
}

export const ToneGenerator = React.forwardRef<ToneGeneratorHandle, ToneGeneratorProps>(({
  output,
  label = 'tone-generator',
  frequency: controlledFrequency,
  onFrequencyChange,
  gain: controlledGain,
  onGainChange,
  waveform: controlledWaveform,
  onWaveformChange,
  cv,
  cvAmount = 100,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [frequency, setFrequency] = useControlledState(controlledFrequency, 440, onFrequencyChange);
  const [gain, setGain] = useControlledState(controlledGain, 0.3, onGainChange);
  const [waveform, setWaveform] = useControlledState<OscillatorType>(controlledWaveform, 'square', onWaveformChange);

  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const cvGainRef = useRef<GainNode | null>(null);

  // Create oscillator once
  useEffect(() => {
    if (!audioContext) return;

    // Create oscillator
    const oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.value = frequency;
    oscillatorRef.current = oscillator;

    // Create gain node
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    // Connect oscillator to gain
    oscillator.connect(gainNode);

    // Start oscillator
    oscillator.start();

    // Set output ref
    output.current = {
      audioNode: oscillator,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'tone',
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
      if (cvGainRef.current) {
        cvGainRef.current.disconnect();
        cvGainRef.current = null;
      }
    };
  }, [audioContext, label]);

  // Handle CV input connection for frequency modulation
  useEffect(() => {
    if (!cv?.current || !oscillatorRef.current || !audioContext) return;

    // Create a gain node to scale the CV signal
    const cvGain = audioContext.createGain();
    cvGain.gain.value = cvAmount;
    cvGainRef.current = cvGain;

    // Connect CV to frequency parameter via gain
    cv.current.gain.connect(cvGain);
    cvGain.connect(oscillatorRef.current.frequency);

    return () => {
      if (cvGain && cv.current) {
        try {
          cv.current.gain.disconnect(cvGain);
          cvGain.disconnect();
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [cv?.current?.audioNode ? String(cv.current.audioNode) : 'null', cvAmount]);

  // Update frequency when it changes (base value)
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  // Update gain when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Update waveform when it changes
  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.type = waveform;
    }
  }, [waveform]);

  // Update CV amount when it changes
  useEffect(() => {
    if (cvGainRef.current) {
      cvGainRef.current.gain.value = cvAmount;
    }
  }, [cvAmount]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getState: () => ({ frequency, gain, waveform }),
  }), [frequency, gain, waveform]);

  // Render children with state
  if (children) {
    return <>{children({
      frequency,
      setFrequency,
      gain,
      setGain,
      waveform,
      setWaveform,
      isActive: !!output.current,
    })}</>;
  }

  return null;
});

ToneGenerator.displayName = 'ToneGenerator';
