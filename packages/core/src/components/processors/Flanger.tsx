import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface FlangerRenderProps {
  rate: number;
  setRate: (value: number) => void;
  depth: number;
  setDepth: (value: number) => void;
  feedback: number;
  setFeedback: (value: number) => void;
  delay: number;
  setDelay: (value: number) => void;
  isActive: boolean;
}

export interface FlangerProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: FlangerRenderProps) => ReactNode;
}

export const Flanger: React.FC<FlangerProps> = ({
  input,
  output,
  label = 'flanger',
  children,
}) => {
  const audioContext = useAudioContext();
  const [rate, setRate] = useState(0.25); // LFO rate in Hz
  const [depth, setDepth] = useState(0.003); // Modulation depth in seconds
  const [feedback, setFeedback] = useState(0.5); // Feedback amount
  const [delay, setDelay] = useState(0.005); // Base delay in seconds

  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackGainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  // Create flanger nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create dry/wet paths
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    dryGain.gain.value = 0.5;
    wetGain.gain.value = 0.5;
    dryGainRef.current = dryGain;
    wetGainRef.current = wetGain;

    // Create delay node (shorter delay than chorus for flanging effect)
    const delayNode = audioContext.createDelay(1.0);
    delayNode.delayTime.value = delay;
    delayNodeRef.current = delayNode;

    // Create feedback path
    const feedbackGain = audioContext.createGain();
    feedbackGain.gain.value = feedback;
    feedbackGainRef.current = feedbackGain;

    // Create LFO for delay time modulation
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

    // Connect LFO to delay time modulation
    lfo.connect(lfoGain);
    lfoGain.connect(delayNode.delayTime);

    // Connect wet path with feedback
    wetGain.connect(delayNode);
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode); // Feedback loop
    delayNode.connect(outputGain);

    // Connect dry path
    dryGain.connect(outputGain);

    // Start LFO
    lfo.start(0);

    // Set output ref
    output.current = {
      audioNode: dryGain,
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
      dryGain.disconnect();
      wetGain.disconnect();
      delayNode.disconnect();
      feedbackGain.disconnect();
      outputGain.disconnect();
      output.current = null;
      dryGainRef.current = null;
      wetGainRef.current = null;
      delayNodeRef.current = null;
      feedbackGainRef.current = null;
      lfoRef.current = null;
      lfoGainRef.current = null;
      outputGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !dryGainRef.current || !wetGainRef.current) return;

    // Connect input to both dry and wet paths
    input.current.gain.connect(dryGainRef.current);
    input.current.gain.connect(wetGainRef.current);

    return () => {
      if (input.current && dryGainRef.current && wetGainRef.current) {
        try {
          input.current.gain.disconnect(dryGainRef.current);
          input.current.gain.disconnect(wetGainRef.current);
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

  // Update base delay
  useEffect(() => {
    if (delayNodeRef.current) {
      delayNodeRef.current.delayTime.value = delay;
    }
  }, [delay]);

  // Render children with state
  if (children) {
    return <>{children({
      rate,
      setRate,
      depth,
      setDepth,
      feedback,
      setFeedback,
      delay,
      setDelay,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
