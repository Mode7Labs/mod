import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface ChorusRenderProps {
  rate: number;
  setRate: (value: number) => void;
  depth: number;
  setDepth: (value: number) => void;
  delay: number;
  setDelay: (value: number) => void;
  wet: number;
  setWet: (value: number) => void;
  isActive: boolean;
}

export interface ChorusProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: ChorusRenderProps) => ReactNode;
}

export const Chorus: React.FC<ChorusProps> = ({
  input,
  output,
  label = 'chorus',
  children,
}) => {
  const audioContext = useAudioContext();
  const [rate, setRate] = useState(1.5); // LFO rate in Hz
  const [depth, setDepth] = useState(0.002); // Modulation depth in seconds
  const [delay, setDelay] = useState(0.02); // Base delay in seconds
  const [wet, setWet] = useState(0.5); // Wet/dry mix

  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Create chorus nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create dry/wet paths
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    dryGainRef.current = dryGain;
    wetGainRef.current = wetGain;

    // Create delay node for chorus effect
    const delayNode = audioContext.createDelay(1.0);
    delayNode.delayTime.value = delay;
    delayNodeRef.current = delayNode;

    // Create LFO (Low Frequency Oscillator) for modulation
    const lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = rate;
    lfoRef.current = lfo;

    // LFO gain controls the depth of modulation
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = depth;
    lfoGainRef.current = lfoGain;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Connect LFO to delay time modulation
    lfo.connect(lfoGain);
    lfoGain.connect(delayNode.delayTime);

    // Connect wet path
    wetGain.connect(delayNode);
    delayNode.connect(outputGain);

    // Connect dry path
    dryGain.connect(outputGain);

    // Start LFO
    lfo.start(0);

    // Set initial wet/dry mix
    const wetAmount = wet;
    const dryAmount = 1 - wet;
    wetGain.gain.value = wetAmount;
    dryGain.gain.value = dryAmount;

    // Set output ref
    output.current = {
      audioNode: dryGain, // Input connects to both dry and wet
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
    };

    // Cleanup
    return () => {
      lfo.stop();
      lfo.disconnect();
      lfoGain.disconnect();
      dryGain.disconnect();
      wetGain.disconnect();
      delayNode.disconnect();
      outputGain.disconnect();
      output.current = null;
      dryGainRef.current = null;
      wetGainRef.current = null;
      delayNodeRef.current = null;
      lfoRef.current = null;
      lfoGainRef.current = null;
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

  // Update LFO rate
  useEffect(() => {
    if (lfoRef.current) {
      lfoRef.current.frequency.value = rate;
    }
  }, [rate]);

  // Update modulation depth
  useEffect(() => {
    if (lfoGainRef.current) {
      lfoGainRef.current.gain.value = depth;
    }
  }, [depth]);

  // Update base delay
  useEffect(() => {
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = delay;
    }
  }, [delay]);

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
      rate,
      setRate,
      depth,
      setDepth,
      delay,
      setDelay,
      wet,
      setWet,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
