import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface LimiterRenderProps {
  threshold: number;
  setThreshold: (value: number) => void;
  release: number;
  setRelease: (value: number) => void;
  isActive: boolean;
}

export interface LimiterProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: LimiterRenderProps) => ReactNode;
}

export const Limiter: React.FC<LimiterProps> = ({
  input,
  output,
  label = 'limiter',
  children,
}) => {
  const audioContext = useAudioContext();
  const [threshold, setThreshold] = useState(-1); // Threshold in dB
  const [release, setRelease] = useState(0.05); // Release time in seconds

  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Create limiter nodes once
  useEffect(() => {
    if (!audioContext) return;

    // A limiter is essentially a compressor with a very high ratio
    const compressor = audioContext.createDynamicsCompressor();

    // Limiter settings: high ratio, fast attack, adjustable release
    compressor.threshold.value = threshold;
    compressor.knee.value = 0; // Hard knee for limiting
    compressor.ratio.value = 20; // Very high ratio for hard limiting
    compressor.attack.value = 0.001; // Very fast attack (1ms)
    compressor.release.value = release;

    compressorRef.current = compressor;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Connect compressor to output
    compressor.connect(outputGain);

    // Set output ref
    output.current = {
      audioNode: compressor,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
    };

    // Cleanup
    return () => {
      compressor.disconnect();
      outputGain.disconnect();
      output.current = null;
      compressorRef.current = null;
      outputGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !compressorRef.current) return;

    input.current.gain.connect(compressorRef.current);

    return () => {
      if (input.current && compressorRef.current) {
        try {
          input.current.gain.disconnect(compressorRef.current);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [input.current?.audioNode ? String(input.current.audioNode) : 'null']);

  // Update threshold
  useEffect(() => {
    if (compressorRef.current) {
      compressorRef.current.threshold.value = threshold;
    }
  }, [threshold]);

  // Update release
  useEffect(() => {
    if (compressorRef.current) {
      compressorRef.current.release.value = release;
    }
  }, [release]);

  // Render children with state
  if (children) {
    return <>{children({
      threshold,
      setThreshold,
      release,
      setRelease,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
