import React, { useEffect, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export type NoiseType = 'white' | 'pink';

export interface NoiseGeneratorHandle {
  getState: () => {
    gain: number;
    type: NoiseType;
  };
}

export interface NoiseGeneratorRenderProps {
  gain: number;
  setGain: (value: number) => void;
  type: NoiseType;
  setType: (value: NoiseType) => void;
  isActive: boolean;
}

export interface NoiseGeneratorProps {
  output: ModStreamRef;
  label?: string;
  // Controlled props
  gain?: number;
  onGainChange?: (gain: number) => void;
  type?: NoiseType;
  onTypeChange?: (type: NoiseType) => void;
  // CV inputs
  cv?: ModStreamRef;
  cvAmount?: number;
  // Render props
  children?: (props: NoiseGeneratorRenderProps) => ReactNode;
}

export const NoiseGenerator = React.forwardRef<NoiseGeneratorHandle, NoiseGeneratorProps>(({
  output,
  label = 'noise-generator',
  gain: controlledGain,
  onGainChange,
  type: controlledType,
  onTypeChange,
  cv,
  cvAmount = 0.3,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [gain, setGain] = useControlledState(controlledGain, 0.3, onGainChange);
  const [type, setType] = useControlledState<NoiseType>(controlledType, 'white', onTypeChange);

  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const cvGainRef = useRef<GainNode | null>(null);
  const cvMultiplierRef = useRef<GainNode | null>(null);

  const createWhiteNoiseBuffer = (audioContext: AudioContext) => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  };

  const createPinkNoiseBuffer = (audioContext: AudioContext) => {
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  };

  useEffect(() => {
    if (!audioContext) return;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    const cvMultiplier = audioContext.createGain();
    cvMultiplier.gain.value = 1.0;
    cvMultiplierRef.current = cvMultiplier;

    gainNode.connect(cvMultiplier);

    output.current = {
      audioNode: cvMultiplier,
      gain: cvMultiplier,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'tone',
      },
    };

    return () => {
      gainNode.disconnect();
      cvMultiplier.disconnect();
      output.current = null;
      gainNodeRef.current = null;
      cvMultiplierRef.current = null;
      if (cvGainRef.current) {
        cvGainRef.current.disconnect();
        cvGainRef.current = null;
      }
    };
  }, [audioContext, label]);

  useEffect(() => {
    if (!cv?.current || !cvMultiplierRef.current || !audioContext) return;

    const cvGain = audioContext.createGain();
    cvGain.gain.value = cvAmount;
    cvGainRef.current = cvGain;

    cvMultiplierRef.current.gain.value = 0;

    cv.current.gain.connect(cvGain);
    cvGain.connect(cvMultiplierRef.current.gain);

    return () => {
      if (cvGain && cv.current && cvMultiplierRef.current) {
        try {
          cv.current.gain.disconnect(cvGain);
          cvGain.disconnect();
          cvMultiplierRef.current.gain.value = 1.0;
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [cv?.current?.audioNode ? String(cv.current.audioNode) : 'null', cvAmount]);

  useEffect(() => {
    if (cvGainRef.current) {
      cvGainRef.current.gain.value = cvAmount;
    }
  }, [cvAmount]);

  useEffect(() => {
    if (!audioContext || !gainNodeRef.current) return;

    if (bufferSourceRef.current) {
      bufferSourceRef.current.stop();
      bufferSourceRef.current.disconnect();
    }

    const buffer = type === 'white'
      ? createWhiteNoiseBuffer(audioContext)
      : createPinkNoiseBuffer(audioContext);

    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;
    bufferSourceRef.current = bufferSource;

    bufferSource.connect(gainNodeRef.current);
    bufferSource.start(0);

    return () => {
      if (bufferSource) {
        try {
          bufferSource.stop();
          bufferSource.disconnect();
        } catch (e) {
          // Already stopped
        }
      }
    };
  }, [audioContext, type]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  useImperativeHandle(ref, () => ({
    getState: () => ({ gain, type }),
  }), [gain, type]);

  if (children) {
    return <>{children({
      gain,
      setGain,
      type,
      setType,
      isActive: !!output.current,
    })}</>;
  }

  return null;
});

NoiseGenerator.displayName = 'NoiseGenerator';
