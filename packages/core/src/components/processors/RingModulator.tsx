import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface RingModulatorRenderProps {
  frequency: number;
  setFrequency: (value: number) => void;
  wet: number;
  setWet: (value: number) => void;
  isActive: boolean;
}

export interface RingModulatorProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: RingModulatorRenderProps) => ReactNode;
}

export const RingModulator: React.FC<RingModulatorProps> = ({
  input,
  output,
  label = 'ringmod',
  children,
}) => {
  const audioContext = useAudioContext();
  const [frequency, setFrequency] = useState(440); // Carrier frequency
  const [wet, setWet] = useState(0.5); // Wet/dry mix

  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const carrierRef = useRef<OscillatorNode | null>(null);
  const modulatorGainRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Create ring modulator nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create dry/wet paths
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    dryGainRef.current = dryGain;
    wetGainRef.current = wetGain;

    // Create carrier oscillator
    const carrier = audioContext.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = frequency;
    carrierRef.current = carrier;

    // Create gain node for modulation
    // In ring modulation, we multiply the input signal by the carrier
    // Web Audio doesn't have a direct multiply node, so we use GainNode
    // and modulate its gain parameter with the carrier
    const modulatorGain = audioContext.createGain();
    modulatorGain.gain.value = 0; // Will be modulated by carrier
    modulatorGainRef.current = modulatorGain;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Connect carrier to modulate the gain
    carrier.connect(modulatorGain.gain);

    // Connect wet path through modulator
    wetGain.connect(modulatorGain);
    modulatorGain.connect(outputGain);

    // Connect dry path
    dryGain.connect(outputGain);

    // Start carrier
    carrier.start(0);

    // Set initial wet/dry mix
    const wetAmount = wet;
    const dryAmount = 1 - wet;
    wetGain.gain.value = wetAmount;
    dryGain.gain.value = dryAmount;

    // Set output ref
    output.current = {
      audioNode: dryGain,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
    };

    // Cleanup
    return () => {
      carrier.stop();
      carrier.disconnect();
      dryGain.disconnect();
      wetGain.disconnect();
      modulatorGain.disconnect();
      outputGain.disconnect();
      output.current = null;
      dryGainRef.current = null;
      wetGainRef.current = null;
      carrierRef.current = null;
      modulatorGainRef.current = null;
      outputGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !dryGainRef.current || !wetGainRef.current) return;

    // Connect input to both dry and wet paths
    input.current.gain.connect(dryGainRef.current);
    input.current.gain.connect(wetGainRef.current);

    return () => {
      if (input.current && dryGainRef.current && wetGainRef.current) {
        try {
          input.current.gain.disconnect(dryGainRef.current);
          input.current.gain.disconnect(wetGainRef.current);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [input.current?.audioNode ? String(input.current.audioNode) : 'null']);

  // Update carrier frequency
  useEffect(() => {
    if (carrierRef.current) {
      carrierRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  // Update wet/dry mix
  useEffect(() => {
    if (wetGainRef.current && dryGainRef.current) {
      const wetAmount = wet;
      const dryAmount = 1 - wet;
      wetGainRef.current.gain.value = wetAmount;
      dryGainRef.current.gain.value = dryAmount;
    }
  }, [wet]);

  // Render children with state
  if (children) {
    return <>{children({
      frequency,
      setFrequency,
      wet,
      setWet,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
