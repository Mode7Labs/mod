import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface FilterRenderProps {
  frequency: number;
  setFrequency: (value: number) => void;
  Q: number;
  setQ: (value: number) => void;
  type: BiquadFilterType;
  setType: (value: BiquadFilterType) => void;
  gain: number;
  setGain: (value: number) => void;
  isActive: boolean;
}

export interface FilterProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  // Initial values (can be overridden by children)
  frequency?: number;
  Q?: number;
  type?: BiquadFilterType;
  gain?: number;
  // CV inputs
  cv?: ModStreamRef;
  cvAmount?: number;
  children?: (props: FilterRenderProps) => ReactNode;
}

export const Filter: React.FC<FilterProps> = ({
  input,
  output,
  label = 'filter',
  frequency: initialFrequency = 1000,
  Q: initialQ = 1,
  type: initialType = 'lowpass',
  gain: initialGain = 0,
  cv,
  cvAmount = 1000,
  children,
}) => {
  const audioContext = useAudioContext();
  const [frequency, setFrequency] = useState(initialFrequency);
  const [Q, setQ] = useState(initialQ);
  const [type, setType] = useState<BiquadFilterType>(initialType);
  const [gain, setGain] = useState(initialGain);

  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const cvGainRef = useRef<GainNode | null>(null);

  // Only recreate when specific input stream changes, not refs
  const inputKey = input.current?.audioNode ? String(input.current.audioNode) : 'null';

  // Create nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create filter node
    const filterNode = audioContext.createBiquadFilter();
    filterNode.type = type;
    filterNode.frequency.value = frequency;
    filterNode.Q.value = Q;
    filterNode.gain.value = gain;
    filterNodeRef.current = filterNode;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    gainNodeRef.current = outputGain;

    // Connect filter to output gain
    filterNode.connect(outputGain);

    // Set output ref
    output.current = {
      audioNode: filterNode,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
      _filterNode: filterNode,
    } as any;

    // Cleanup
    return () => {
      filterNode.disconnect();
      outputGain.disconnect();
      output.current = null;
      filterNodeRef.current = null;
      gainNodeRef.current = null;
      if (cvGainRef.current) {
        cvGainRef.current.disconnect();
        cvGainRef.current = null;
      }
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !filterNodeRef.current) return;

    input.current.gain.connect(filterNodeRef.current);

    return () => {
      if (input.current && filterNodeRef.current) {
        try {
          input.current.gain.disconnect(filterNodeRef.current);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [inputKey]);

  // Handle CV input connection for frequency modulation
  useEffect(() => {
    if (!cv?.current || !filterNodeRef.current || !audioContext) return;

    // Create a gain node to scale the CV signal
    const cvGain = audioContext.createGain();
    cvGain.gain.value = cvAmount;
    cvGainRef.current = cvGain;

    // Connect CV to frequency parameter via gain
    cv.current.gain.connect(cvGain);
    cvGain.connect(filterNodeRef.current.frequency);

    return () => {
      if (cvGain && cv.current) {
        try {
          cv.current.gain.disconnect(cvGain);
          cvGain.disconnect();
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [cv?.current?.audioNode ? String(cv.current.audioNode) : 'null', cvAmount]);

  // Update frequency when it changes (base value)
  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  // Update Q when it changes
  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.Q.value = Q;
    }
  }, [Q]);

  // Update type when it changes
  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.type = type;
    }
  }, [type]);

  // Update gain when it changes (for peaking/shelving filters)
  useEffect(() => {
    if (filterNodeRef.current) {
      filterNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Update CV amount when it changes
  useEffect(() => {
    if (cvGainRef.current) {
      cvGainRef.current.gain.value = cvAmount;
    }
  }, [cvAmount]);

  // Render children with state
  if (children) {
    return <>{children({
      frequency,
      setFrequency,
      Q,
      setQ,
      type,
      setType,
      gain,
      setGain,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
