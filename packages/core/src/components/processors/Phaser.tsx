import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface PhaserRenderProps {
  rate: number;
  setRate: (value: number) => void;
  depth: number;
  setDepth: (value: number) => void;
  feedback: number;
  setFeedback: (value: number) => void;
  baseFreq: number;
  setBaseFreq: (value: number) => void;
  isActive: boolean;
}

export interface PhaserProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: PhaserRenderProps) => ReactNode;
}

export const Phaser: React.FC<PhaserProps> = ({
  input,
  output,
  label = 'phaser',
  children,
}) => {
  const audioContext = useAudioContext();
  const [rate, setRate] = useState(0.5); // LFO rate in Hz
  const [depth, setDepth] = useState(500); // Modulation depth in Hz
  const [feedback, setFeedback] = useState(0.5); // Feedback amount
  const [baseFreq, setBaseFreq] = useState(800); // Base frequency

  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const feedbackGainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Create phaser nodes once
  useEffect(() => {
    if (!audioContext) return;

    const numStages = 4; // Number of allpass filters
    const filters: BiquadFilterNode[] = [];

    // Create allpass filters
    for (let i = 0; i < numStages; i++) {
      const filter = audioContext.createBiquadFilter();
      filter.type = 'allpass';
      filter.frequency.value = baseFreq;
      filter.Q.value = 1;
      filters.push(filter);
    }
    filtersRef.current = filters;

    // Create feedback path
    const feedbackGain = audioContext.createGain();
    feedbackGain.gain.value = feedback;
    feedbackGainRef.current = feedbackGain;

    // Create LFO for frequency modulation
    const lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = rate;
    lfoRef.current = lfo;

    // LFO gain controls modulation depth
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = depth;
    lfoGainRef.current = lfoGain;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Connect filters in series
    for (let i = 0; i < numStages - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }

    // Connect feedback from last filter to first
    filters[numStages - 1].connect(feedbackGain);
    feedbackGain.connect(filters[0]);

    // Connect last filter to output
    filters[numStages - 1].connect(outputGain);

    // Connect LFO to all filter frequencies
    lfo.connect(lfoGain);
    for (const filter of filters) {
      lfoGain.connect(filter.frequency);
    }

    // Start LFO
    lfo.start(0);

    // Set output ref
    output.current = {
      audioNode: filters[0],
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
    };

    // Cleanup
    return () => {
      lfo.stop();
      lfo.disconnect();
      lfoGain.disconnect();
      feedbackGain.disconnect();
      filters.forEach(filter => filter.disconnect());
      outputGain.disconnect();
      output.current = null;
      filtersRef.current = [];
      feedbackGainRef.current = null;
      lfoRef.current = null;
      lfoGainRef.current = null;
      outputGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || filtersRef.current.length === 0) return;

    const firstFilter = filtersRef.current[0];
    input.current.gain.connect(firstFilter);

    return () => {
      if (input.current && firstFilter) {
        try {
          input.current.gain.disconnect(firstFilter);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [input.current?.audioNode ? String(input.current.audioNode) : 'null']);

  // Update LFO rate
  useEffect(() => {
    if (lfoRef.current) {
      lfoRef.current.frequency.value = rate;
    }
  }, [rate]);

  // Update modulation depth
  useEffect(() => {
    if (lfoGainRef.current) {
      lfoGainRef.current.gain.value = depth;
    }
  }, [depth]);

  // Update feedback
  useEffect(() => {
    if (feedbackGainRef.current) {
      feedbackGainRef.current.gain.value = feedback;
    }
  }, [feedback]);

  // Update base frequency
  useEffect(() => {
    for (const filter of filtersRef.current) {
      filter.frequency.value = baseFreq;
    }
  }, [baseFreq]);

  // Render children with state
  if (children) {
    return <>{children({
      rate,
      setRate,
      depth,
      setDepth,
      feedback,
      setFeedback,
      baseFreq,
      setBaseFreq,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
