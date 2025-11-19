import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface AutoWahRenderProps {
  sensitivity: number;
  setSensitivity: (value: number) => void;
  baseFreq: number;
  setBaseFreq: (value: number) => void;
  maxFreq: number;
  setMaxFreq: (value: number) => void;
  Q: number;
  setQ: (value: number) => void;
  isActive: boolean;
}

export interface AutoWahProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: AutoWahRenderProps) => ReactNode;
}

export const AutoWah: React.FC<AutoWahProps> = ({
  input,
  output,
  label = 'autowah',
  children,
}) => {
  const audioContext = useAudioContext();
  const [sensitivity, setSensitivity] = useState(1000); // Envelope sensitivity
  const [baseFreq, setBaseFreq] = useState(200); // Base frequency
  const [maxFreq, setMaxFreq] = useState(2000); // Maximum frequency
  const [Q, setQ] = useState(5); // Filter resonance

  const filterRef = useRef<BiquadFilterNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const envelopeRef = useRef<number>(0);

  // Store current parameter values in refs so audio callback can access them
  const sensitivityRef = useRef<number>(sensitivity);
  const baseFreqRef = useRef<number>(baseFreq);
  const maxFreqRef = useRef<number>(maxFreq);

  // Update refs when parameters change
  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  useEffect(() => {
    baseFreqRef.current = baseFreq;
  }, [baseFreq]);

  useEffect(() => {
    maxFreqRef.current = maxFreq;
  }, [maxFreq]);

  // Create autowah nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create bandpass filter that will be modulated
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = baseFreq;
    filter.Q.value = Q;
    filterRef.current = filter;

    // Create script processor for envelope following
    const bufferSize = 256; // Smaller buffer for faster response
    const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
    scriptNodeRef.current = scriptNode;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    const attackCoeff = 0.9;
    const releaseCoeff = 0.999;

    // Process audio and extract envelope - reading from refs for current values
    scriptNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer.getChannelData(0);
      const outputBuffer = event.outputBuffer.getChannelData(0);

      // Read current parameter values from refs
      const currentSensitivity = sensitivityRef.current;
      const currentBaseFreq = baseFreqRef.current;
      const currentMaxFreq = maxFreqRef.current;

      for (let i = 0; i < inputBuffer.length; i++) {
        const inputSample = inputBuffer[i];
        const inputLevel = Math.abs(inputSample);

        // Envelope follower
        if (inputLevel > envelopeRef.current) {
          envelopeRef.current = attackCoeff * envelopeRef.current + (1 - attackCoeff) * inputLevel;
        } else {
          envelopeRef.current = releaseCoeff * envelopeRef.current + (1 - releaseCoeff) * inputLevel;
        }

        // Map envelope to filter frequency
        const freqRange = currentMaxFreq - currentBaseFreq;
        const targetFreq = currentBaseFreq + (envelopeRef.current * currentSensitivity * freqRange);
        const clampedFreq = Math.max(currentBaseFreq, Math.min(currentMaxFreq, targetFreq));

        // Update filter frequency
        if (filter) {
          filter.frequency.value = clampedFreq;
        }

        outputBuffer[i] = inputSample;
      }
    };

    // Connect nodes: script -> filter -> output
    scriptNode.connect(filter);
    filter.connect(outputGain);

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
      filter.disconnect();
      outputGain.disconnect();
      output.current = null;
      filterRef.current = null;
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

  // Update filter Q when it changes
  useEffect(() => {
    if (filterRef.current) {
      filterRef.current.Q.value = Q;
    }
  }, [Q]);

  // Render children with state
  if (children) {
    return <>{children({
      sensitivity,
      setSensitivity,
      baseFreq,
      setBaseFreq,
      maxFreq,
      setMaxFreq,
      Q,
      setQ,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
