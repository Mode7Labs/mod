import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface BitCrusherRenderProps {
  bitDepth: number;
  setBitDepth: (value: number) => void;
  sampleReduction: number;
  setSampleReduction: (value: number) => void;
  isActive: boolean;
}

export interface BitCrusherProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: BitCrusherRenderProps) => ReactNode;
}

export const BitCrusher: React.FC<BitCrusherProps> = ({
  input,
  output,
  label = 'bitcrusher',
  children,
}) => {
  const audioContext = useAudioContext();
  const [bitDepth, setBitDepth] = useState(8); // Bit depth (1-16)
  const [sampleReduction, setSampleReduction] = useState(1); // Sample rate reduction factor

  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const lastSampleRef = useRef<number>(0);
  const sampleCountRef = useRef<number>(0);

  // Store current parameter values in refs so audio callback can access them
  const bitDepthRef = useRef<number>(bitDepth);
  const sampleReductionRef = useRef<number>(sampleReduction);

  // Update refs when parameters change
  useEffect(() => {
    bitDepthRef.current = bitDepth;
  }, [bitDepth]);

  useEffect(() => {
    sampleReductionRef.current = sampleReduction;
  }, [sampleReduction]);

  // Create bitcrusher nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Use ScriptProcessorNode for custom audio processing
    // Note: This is deprecated but still widely supported. AudioWorklet is the modern replacement.
    const bufferSize = 4096;
    const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
    scriptNodeRef.current = scriptNode;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Process audio - reading from refs for current values
    scriptNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer.getChannelData(0);
      const outputBuffer = event.outputBuffer.getChannelData(0);

      // Read current parameter values from refs
      const currentBitDepth = bitDepthRef.current;
      const currentSampleReduction = Math.max(1, Math.floor(sampleReductionRef.current));
      const step = Math.pow(2, currentBitDepth) - 1;

      for (let i = 0; i < inputBuffer.length; i++) {
        // Sample rate reduction - use modulo to prevent overflow
        if ((sampleCountRef.current % currentSampleReduction) === 0) {
          // Bit depth reduction
          lastSampleRef.current = Math.round(inputBuffer[i] * step) / step;
        }
        sampleCountRef.current = (sampleCountRef.current + 1) % 1000000; // Prevent overflow

        outputBuffer[i] = lastSampleRef.current;
      }
    };

    // Connect nodes
    scriptNode.connect(outputGain);

    // Set output ref
    output.current = {
      audioNode: scriptNode,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
    };

    // Cleanup
    return () => {
      scriptNode.disconnect();
      outputGain.disconnect();
      output.current = null;
      scriptNodeRef.current = null;
      outputGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !scriptNodeRef.current) return;

    input.current.gain.connect(scriptNodeRef.current);

    return () => {
      if (input.current && scriptNodeRef.current) {
        try {
          input.current.gain.disconnect(scriptNodeRef.current);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [input.current?.audioNode ? String(input.current.audioNode) : 'null']);

  // Render children with state
  if (children) {
    return <>{children({
      bitDepth,
      setBitDepth,
      sampleReduction,
      setSampleReduction,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
