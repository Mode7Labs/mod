import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface EQRenderProps {
  lowGain: number;
  setLowGain: (value: number) => void;
  midGain: number;
  setMidGain: (value: number) => void;
  highGain: number;
  setHighGain: (value: number) => void;
  lowFreq: number;
  setLowFreq: (value: number) => void;
  highFreq: number;
  setHighFreq: (value: number) => void;
  isActive: boolean;
}

export interface EQProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: EQRenderProps) => ReactNode;
}

export const EQ: React.FC<EQProps> = ({
  input,
  output,
  label = 'eq',
  children,
}) => {
  const audioContext = useAudioContext();
  const [lowGain, setLowGain] = useState(0);
  const [midGain, setMidGain] = useState(0);
  const [highGain, setHighGain] = useState(0);
  const [lowFreq, setLowFreq] = useState(250);
  const [highFreq, setHighFreq] = useState(4000);

  const lowShelfRef = useRef<BiquadFilterNode | null>(null);
  const midPeakRef = useRef<BiquadFilterNode | null>(null);
  const highShelfRef = useRef<BiquadFilterNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Create filter nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create three filters: lowshelf, peaking (mid), highshelf
    const lowShelf = audioContext.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = lowFreq;
    lowShelf.gain.value = lowGain;
    lowShelfRef.current = lowShelf;

    const midPeak = audioContext.createBiquadFilter();
    midPeak.type = 'peaking';
    midPeak.frequency.value = 1000; // Mid frequency (between low and high)
    midPeak.Q.value = 1;
    midPeak.gain.value = midGain;
    midPeakRef.current = midPeak;

    const highShelf = audioContext.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = highFreq;
    highShelf.gain.value = highGain;
    highShelfRef.current = highShelf;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Chain filters together
    lowShelf.connect(midPeak);
    midPeak.connect(highShelf);
    highShelf.connect(outputGain);

    // Set output ref
    output.current = {
      audioNode: lowShelf,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
    };

    // Cleanup
    return () => {
      lowShelf.disconnect();
      midPeak.disconnect();
      highShelf.disconnect();
      outputGain.disconnect();
      output.current = null;
      lowShelfRef.current = null;
      midPeakRef.current = null;
      highShelfRef.current = null;
      outputGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !lowShelfRef.current) return;

    input.current.gain.connect(lowShelfRef.current);

    return () => {
      if (input.current && lowShelfRef.current) {
        try {
          input.current.gain.disconnect(lowShelfRef.current);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [input.current?.audioNode ? String(input.current.audioNode) : 'null']);

  // Update low shelf parameters
  useEffect(() => {
    if (lowShelfRef.current) {
      lowShelfRef.current.frequency.value = lowFreq;
      lowShelfRef.current.gain.value = lowGain;
    }
  }, [lowFreq, lowGain]);

  // Update mid peak parameters
  useEffect(() => {
    if (midPeakRef.current) {
      // Mid frequency is calculated as geometric mean of low and high
      const midFreq = Math.sqrt(lowFreq * highFreq);
      midPeakRef.current.frequency.value = midFreq;
      midPeakRef.current.gain.value = midGain;
    }
  }, [lowFreq, highFreq, midGain]);

  // Update high shelf parameters
  useEffect(() => {
    if (highShelfRef.current) {
      highShelfRef.current.frequency.value = highFreq;
      highShelfRef.current.gain.value = highGain;
    }
  }, [highFreq, highGain]);

  // Render children with state
  if (children) {
    return <>{children({
      lowGain,
      setLowGain,
      midGain,
      setMidGain,
      highGain,
      setHighGain,
      lowFreq,
      setLowFreq,
      highFreq,
      setHighFreq,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
