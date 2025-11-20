import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface ReverbRenderProps {
  wet: number;
  setWet: (value: number) => void;
  duration: number;
  setDuration: (value: number) => void;
  decay: number;
  setDecay: (value: number) => void;
  isActive: boolean;
}

export interface ReverbProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: ReverbRenderProps) => ReactNode;
}

export const Reverb: React.FC<ReverbProps> = ({
  input,
  output,
  label = 'reverb',
  children,
}) => {
  const audioContext = useAudioContext();
  const [wet, setWet] = useState(0.3);
  const [duration, setDuration] = useState(2.0);
  const [decay, setDecay] = useState(2.0);

  // Track input changes
  const inputKey = input.current?.audioNode ? String(input.current.audioNode) : 'null';

  const convolverRef = useRef<ConvolverNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);

  // Create nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create convolver for reverb
    const convolver = audioContext.createConvolver();
    convolverRef.current = convolver;

    // Generate impulse response
    const rate = audioContext.sampleRate;
    const length = rate * duration;
    const impulse = audioContext.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }

    convolver.buffer = impulse;

    // Create wet/dry mix
    const wetGain = audioContext.createGain();
    wetGain.gain.value = wet;
    wetGainRef.current = wetGain;

    const dryGain = audioContext.createGain();
    dryGain.gain.value = 1 - wet;
    dryGainRef.current = dryGain;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;

    // Connect convolver to wet gain
    convolver.connect(wetGain);

    // Mix wet and dry to output
    wetGain.connect(outputGain);
    dryGain.connect(outputGain);

    // Set output ref with nodes for later parameter updates
    output.current = {
      audioNode: convolver,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
      _wetGain: wetGain,
      _dryGain: dryGain,
      _convolver: convolver,
      _duration: duration,
      _decay: decay,
    } as any;

    // Cleanup
    return () => {
      convolver.disconnect();
      wetGain.disconnect();
      dryGain.disconnect();
      outputGain.disconnect();
      output.current = null;
      convolverRef.current = null;
      wetGainRef.current = null;
      dryGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !convolverRef.current || !dryGainRef.current) return;

    const currentInput = input.current;
    const convolver = convolverRef.current;
    const dryGain = dryGainRef.current;

    // Connect input to both dry and convolver
    currentInput.gain.connect(dryGain);
    currentInput.gain.connect(convolver);

    return () => {
      if (currentInput && dryGain && convolver) {
        try {
          currentInput.gain.disconnect(dryGain);
          currentInput.gain.disconnect(convolver);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [inputKey]);

  // Update wet/dry mix when it changes
  useEffect(() => {
    const stream = output.current as any;
    if (stream?._wetGain && stream?._dryGain) {
      stream._wetGain.gain.value = wet;
      stream._dryGain.gain.value = 1 - wet;
    }
  }, [wet, output]);

  // Regenerate impulse response when duration or decay changes
  useEffect(() => {
    const stream = output.current as any;
    if (stream?._convolver && audioContext) {
      const rate = audioContext.sampleRate;
      const length = rate * duration;
      const impulse = audioContext.createBuffer(2, length, rate);
      const impulseL = impulse.getChannelData(0);
      const impulseR = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }

      stream._convolver.buffer = impulse;
    }
  }, [duration, decay, output, audioContext]);

  // Render children with state
  if (children) {
    return <>{children({
      wet,
      setWet,
      duration,
      setDuration,
      decay,
      setDecay,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
