import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface CompressorRenderProps {
  threshold: number;
  setThreshold: (value: number) => void;
  knee: number;
  setKnee: (value: number) => void;
  ratio: number;
  setRatio: (value: number) => void;
  attack: number;
  setAttack: (value: number) => void;
  release: number;
  setRelease: (value: number) => void;
  isActive: boolean;
}

export interface CompressorProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: CompressorRenderProps) => ReactNode;
}

export const Compressor: React.FC<CompressorProps> = ({
  input,
  output,
  label = 'compressor',
  children,
}) => {
  const audioContext = useAudioContext();
  const [threshold, setThreshold] = useState(-24);
  const [knee, setKnee] = useState(30);
  const [ratio, setRatio] = useState(12);
  const [attack, setAttack] = useState(0.003);
  const [release, setRelease] = useState(0.25);

  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Only recreate when specific input stream changes, not refs
  const inputKey = input.current?.audioNode ? String(input.current.audioNode) : 'null';

  // Create nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create compressor node
    const compressorNode = audioContext.createDynamicsCompressor();
    compressorNode.threshold.value = threshold;
    compressorNode.knee.value = knee;
    compressorNode.ratio.value = ratio;
    compressorNode.attack.value = attack;
    compressorNode.release.value = release;
    compressorNodeRef.current = compressorNode;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    gainNodeRef.current = outputGain;

    // Connect compressor to output gain
    compressorNode.connect(outputGain);

    // Set output ref
    output.current = {
      audioNode: compressorNode,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
      _compressorNode: compressorNode,
    } as any;

    // Cleanup
    return () => {
      compressorNode.disconnect();
      outputGain.disconnect();
      output.current = null;
      compressorNodeRef.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !compressorNodeRef.current) return;

    input.current.gain.connect(compressorNodeRef.current);

    return () => {
      if (input.current && compressorNodeRef.current) {
        try {
          input.current.gain.disconnect(compressorNodeRef.current);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [inputKey]);

  // Update threshold when it changes
  useEffect(() => {
    if (compressorNodeRef.current) {
      compressorNodeRef.current.threshold.value = threshold;
    }
  }, [threshold]);

  // Update knee when it changes
  useEffect(() => {
    if (compressorNodeRef.current) {
      compressorNodeRef.current.knee.value = knee;
    }
  }, [knee]);

  // Update ratio when it changes
  useEffect(() => {
    if (compressorNodeRef.current) {
      compressorNodeRef.current.ratio.value = ratio;
    }
  }, [ratio]);

  // Update attack when it changes
  useEffect(() => {
    if (compressorNodeRef.current) {
      compressorNodeRef.current.attack.value = attack;
    }
  }, [attack]);

  // Update release when it changes
  useEffect(() => {
    if (compressorNodeRef.current) {
      compressorNodeRef.current.release.value = release;
    }
  }, [release]);

  // Render children with state
  if (children) {
    return <>{children({
      threshold,
      setThreshold,
      knee,
      setKnee,
      ratio,
      setRatio,
      attack,
      setAttack,
      release,
      setRelease,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
