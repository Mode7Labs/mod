import React, { useEffect, useRef, ReactNode, useImperativeHandle, useState } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export type CrossFadeMode = 'linear' | 'equal-power' | 'equal-gain' | 'exponential' | 'dj-cut' | 'smooth-step';

export interface CrossFadeHandle {
  getState: () => {
    mix: number;
    mode: CrossFadeMode;
  };
}

export interface CrossFadeRenderProps {
  mix: number;
  setMix: (value: number) => void;
  mode: CrossFadeMode;
  setMode: (mode: CrossFadeMode) => void;
  isActive: boolean;
}

export interface CrossFadeProps {
  inputs: [ModStreamRef, ModStreamRef];
  output: ModStreamRef;
  label?: string;
  // Controlled props
  mix?: number;
  onMixChange?: (mix: number) => void;
  mode?: CrossFadeMode;
  onModeChange?: (mode: CrossFadeMode) => void;
  // Render props
  children?: (props: CrossFadeRenderProps) => ReactNode;
}

// Calculate gain values based on crossfade mode
const calculateGains = (mix: number, mode: CrossFadeMode): [number, number] => {
  switch (mode) {
    case 'linear':
      // Simple linear crossfade (can have volume dip in middle)
      return [1 - mix, mix];

    case 'equal-power':
      // Constant power crossfade using cosine curves
      const angleA = (1 - mix) * Math.PI / 2;
      const angleB = mix * Math.PI / 2;
      return [Math.cos(angleA), Math.cos(angleB)];

    case 'equal-gain':
      // Equal gain - simpler than equal power
      return [1 - mix, mix];

    case 'exponential':
      // Exponential curve for smoother transitions
      const expA = Math.pow(1 - mix, 2);
      const expB = Math.pow(mix, 2);
      return [expA, expB];

    case 'dj-cut':
      // DJ-style cut - sharp transition in the middle
      if (mix < 0.45) return [1, 0];
      if (mix > 0.55) return [0, 1];
      // Quick crossfade in the middle 10%
      const djMix = (mix - 0.45) / 0.1;
      return [1 - djMix, djMix];

    case 'smooth-step':
      // Smooth S-curve using smoothstep function
      const smoothMix = mix * mix * (3 - 2 * mix);
      return [1 - smoothMix, smoothMix];

    default:
      return [1 - mix, mix];
  }
};

export const CrossFade = React.forwardRef<CrossFadeHandle, CrossFadeProps>(({
  inputs,
  output,
  label = 'crossfade',
  mix: controlledMix,
  onMixChange,
  mode: controlledMode,
  onModeChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [mix, setMix] = useControlledState(controlledMix, 0.5, onMixChange);
  const [mode, setMode] = useControlledState<CrossFadeMode>(controlledMode, 'equal-power', onModeChange);

  const [inputA, inputB] = inputs;

  // Keep refs to nodes so we can disconnect/reconnect without recreating output
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Track input nodes for dependency tracking
  const [inputNodes, setInputNodes] = useState(inputs.map(i => i.current?.audioNode));

  // Create output gain once
  useEffect(() => {
    if (!audioContext) return;

    // Create output gain (only once)
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Create gain nodes for inputs
    const gainA = audioContext.createGain();
    const gainB = audioContext.createGain();
    gainARef.current = gainA;
    gainBRef.current = gainB;

    // Set gain values based on mix and mode
    const [gainAValue, gainBValue] = calculateGains(mix, mode);
    gainA.gain.value = gainAValue;
    gainB.gain.value = gainBValue;

    // Connect both gains to output
    gainA.connect(outputGain);
    gainB.connect(outputGain);

    // Set output ref with internal node references
    output.current = {
      audioNode: gainA, // Representative node
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'mixer',
      },
      _gainA: gainA,
      _gainB: gainB,
    } as any;

    // Cleanup
    return () => {
      gainA.disconnect();
      gainB.disconnect();
      outputGain.disconnect();
      output.current = null;
      gainARef.current = null;
      gainBRef.current = null;
      outputGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connections separately
  useEffect(() => {
    if (!gainARef.current || !gainBRef.current) return;

    // Track changes to input nodes
    const currentNodes = inputs.map(i => i.current?.audioNode);
    if (JSON.stringify(currentNodes) !== JSON.stringify(inputNodes)) {
      setInputNodes(currentNodes);
    }

    // Connect input A to its gain
    if (inputA.current) {
      inputA.current.gain.connect(gainARef.current);
    }

    // Connect input B to its gain
    if (inputB.current) {
      inputB.current.gain.connect(gainBRef.current);
    }

    return () => {
      // Disconnect when inputs change
      if (inputA.current && gainARef.current) {
        try {
          inputA.current.gain.disconnect(gainARef.current);
        } catch (e) {
          // Already disconnected
        }
      }
      if (inputB.current && gainBRef.current) {
        try {
          inputB.current.gain.disconnect(gainBRef.current);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [inputNodes, inputA, inputB]);

  // Update mix and mode when they change
  useEffect(() => {
    const stream = output.current as any;
    if (stream?._gainA && stream?._gainB) {
      const [gainAValue, gainBValue] = calculateGains(mix, mode);
      stream._gainA.gain.value = gainAValue;
      stream._gainB.gain.value = gainBValue;
    }
  }, [mix, mode, output]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getState: () => ({ mix, mode }),
  }), [mix, mode]);

  // Render children with state
  if (children) {
    return <>{children({
      mix,
      setMix,
      mode,
      setMode,
      isActive: !!output.current,
    })}</>;
  }

  return null;
});

CrossFade.displayName = 'CrossFade';
