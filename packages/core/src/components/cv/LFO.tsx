import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export type LFOWaveform = 'sine' | 'square' | 'sawtooth' | 'triangle';

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
  children?: (props: LFORenderProps) => ReactNode;
}

export const LFO: React.FC<LFOProps> = ({
  output,
  label = 'lfo',
  children,
}) => {
  const audioContext = useAudioContext();
  const [frequency, setFrequency] = useState(1); // LFO frequency in Hz (0.1 - 20 Hz)
  const [amplitude, setAmplitude] = useState(1); // Amplitude (0-1)
  const [waveform, setWaveform] = useState<LFOWaveform>('sine');

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
};
