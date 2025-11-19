import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface MixerRenderProps {
  levels: number[];
  setLevels: (levels: number[]) => void;
  setLevel: (index: number, value: number) => void;
  isActive: boolean;
}

export interface MixerProps {
  inputs: ModStreamRef[];
  output: ModStreamRef;
  label?: string;
  children?: (props: MixerRenderProps) => ReactNode;
}

export const Mixer: React.FC<MixerProps> = ({
  inputs,
  output,
  label = 'mixer',
  children,
}) => {
  const audioContext = useAudioContext();

  // Initialize levels based on inputs length
  const [levels, setLevels] = useState<number[]>(() => inputs.map(() => 1.0));

  // Keep refs to nodes
  const inputGainsRef = useRef<GainNode[]>([]);
  const outputGainRef = useRef<GainNode | null>(null);

  // Create nodes - track specific input streams, not just connection state
  const inputsKey = inputs.map(i => i.current?.audioNode ? String(i.current.audioNode) : 'null').join(',');

  // Create output gain and input gains once
  useEffect(() => {
    if (!audioContext || inputs.length === 0) return;

    // Create output gain (only once)
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Create gain nodes for each input
    const inputGains = inputs.map((_input, index) => {
      const gain = audioContext.createGain();
      const level = levels && levels[index] !== undefined ? levels[index] : 1.0;
      gain.gain.value = level;
      return gain;
    });
    inputGainsRef.current = inputGains;

    // Connect all input gains to output
    inputGains.forEach(gain => {
      gain.connect(outputGain);
    });

    // Set output ref with internal gain references
    output.current = {
      audioNode: inputGains[0], // Representative node
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'mixer',
      },
      _inputGains: inputGains,
    } as any;

    // Cleanup
    return () => {
      inputGains.forEach(gain => gain.disconnect());
      outputGain.disconnect();
      output.current = null;
      inputGainsRef.current = [];
      outputGainRef.current = null;
    };
  }, [audioContext, label, inputs.length]);

  // Handle input connections separately
  useEffect(() => {
    if (!inputGainsRef.current.length) return;

    inputs.forEach((input, index) => {
      if (input.current && inputGainsRef.current[index]) {
        // Disconnect any previous connection
        try {
          inputGainsRef.current[index].disconnect();
          inputGainsRef.current[index].connect(outputGainRef.current!);
        } catch (e) {
          // Ignore
        }

        // Connect new input
        input.current.gain.connect(inputGainsRef.current[index]);
      }
    });

    // Cleanup when inputs change
    return () => {
      inputs.forEach((input, index) => {
        if (input.current && inputGainsRef.current[index]) {
          try {
            input.current.gain.disconnect(inputGainsRef.current[index]);
          } catch (e) {
            // Already disconnected
          }
        }
      });
    };
  }, [inputsKey]);

  // Update levels when they change
  useEffect(() => {
    const stream = output.current as any;
    if (stream?._inputGains) {
      levels.forEach((level, index) => {
        if (stream._inputGains[index]) {
          stream._inputGains[index].gain.value = level;
        }
      });
    }
  }, [levels, output]);

  // Helper to update a single level
  const setLevel = (index: number, value: number) => {
    setLevels(prev => {
      const newLevels = [...prev];
      newLevels[index] = value;
      return newLevels;
    });
  };

  // Render children with state
  if (children) {
    return <>{children({
      levels,
      setLevels,
      setLevel,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
