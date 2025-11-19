import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export type NoiseType = 'white' | 'pink';

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
  // Initial values (can be overridden by children)
  gain?: number;
  type?: NoiseType;
  // CV inputs
  cv?: ModStreamRef;
  cvAmount?: number;
  children?: (props: NoiseGeneratorRenderProps) => ReactNode;
}

export const NoiseGenerator: React.FC<NoiseGeneratorProps> = ({
  output,
  label = 'noise-generator',
  gain: initialGain = 0.3,
  type: initialType = 'white',
  cv,
  cvAmount = 0.3,
  children,
}) => {
  const audioContext = useAudioContext();
  const [gain, setGain] = useState(initialGain);
  const [type, setType] = useState<NoiseType>(initialType);

  const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const cvGainRef = useRef<GainNode | null>(null);
  const cvMultiplierRef = useRef<GainNode | null>(null);

  // Create white noise buffer
  const createWhiteNoiseBuffer = (audioContext: AudioContext) => {
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  };

  // Create pink noise buffer (1/f noise)
  const createPinkNoiseBuffer = (audioContext: AudioContext) => {
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds
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
      output[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }

    return buffer;
  };

  // Create noise source once
  useEffect(() => {
    if (!audioContext) return;

    // Create gain node for base amplitude
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    // Create CV multiplier gain node (defaults to 1.0 for no CV)
    const cvMultiplier = audioContext.createGain();
    cvMultiplier.gain.value = 1.0;
    cvMultiplierRef.current = cvMultiplier;

    // Chain: source -> gainNode -> cvMultiplier -> output
    gainNode.connect(cvMultiplier);

    // Set output ref
    output.current = {
      audioNode: cvMultiplier,
      gain: cvMultiplier,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'tone',
      },
    };

    // Cleanup
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

  // Handle CV input connection for gain modulation
  useEffect(() => {
    if (!cv?.current || !cvMultiplierRef.current || !audioContext) return;

    // When CV is connected, the CV signal (0-1) directly controls the multiplier gain
    // CV = 0 means silence, CV = 1 means full volume
    // We scale by cvAmount to control the depth of modulation
    const cvGain = audioContext.createGain();
    cvGain.gain.value = cvAmount;
    cvGainRef.current = cvGain;

    // Set multiplier base to 0 when CV is connected (CV will add to it)
    cvMultiplierRef.current.gain.value = 0;

    // Connect CV to multiplier gain parameter
    cv.current.gain.connect(cvGain);
    cvGain.connect(cvMultiplierRef.current.gain);

    return () => {
      if (cvGain && cv.current && cvMultiplierRef.current) {
        try {
          cv.current.gain.disconnect(cvGain);
          cvGain.disconnect();
          // Restore to 1.0 when CV is disconnected
          cvMultiplierRef.current.gain.value = 1.0;
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [cv?.current?.audioNode ? String(cv.current.audioNode) : 'null', cvAmount]);

  // Update CV amount when it changes
  useEffect(() => {
    if (cvGainRef.current) {
      cvGainRef.current.gain.value = cvAmount;
    }
  }, [cvAmount]);

  // Handle noise type changes
  useEffect(() => {
    if (!audioContext || !gainNodeRef.current) return;

    // Stop previous source
    if (bufferSourceRef.current) {
      bufferSourceRef.current.stop();
      bufferSourceRef.current.disconnect();
    }

    // Create appropriate noise buffer
    const buffer = type === 'white'
      ? createWhiteNoiseBuffer(audioContext)
      : createPinkNoiseBuffer(audioContext);

    // Create buffer source
    const bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.loop = true;
    bufferSourceRef.current = bufferSource;

    // Connect source to gain
    bufferSource.connect(gainNodeRef.current);

    // Start the noise
    bufferSource.start(0);

    // Cleanup when type changes
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

  // Update gain when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Render children with state
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
};
