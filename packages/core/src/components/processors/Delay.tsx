import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface DelayRenderProps {
  time: number;
  setTime: (value: number) => void;
  feedback: number;
  setFeedback: (value: number) => void;
  wet: number;
  setWet: (value: number) => void;
  isActive: boolean;
}

export interface DelayProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  children?: (props: DelayRenderProps) => ReactNode;
}

export const Delay: React.FC<DelayProps> = ({
  input,
  output,
  label = 'delay',
  children,
}) => {
  const audioContext = useAudioContext();
  const [time, setTime] = useState(0.5);
  const [feedback, setFeedback] = useState(0.3);
  const [wet, setWet] = useState(0.5);

  // Track input changes
  const inputKey = input.current?.audioNode ? String(input.current.audioNode) : 'null';

  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);

  // Create nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create delay node
    const delayNode = audioContext.createDelay(5.0);
    delayNode.delayTime.value = time;
    delayNodeRef.current = delayNode;

    // Create feedback gain
    const feedbackGain = audioContext.createGain();
    feedbackGain.gain.value = feedback;
    feedbackGainRef.current = feedbackGain;

    // Create wet/dry mix
    const wetGain = audioContext.createGain();
    wetGain.gain.value = wet;
    wetGainRef.current = wetGain;

    const dryGain = audioContext.createGain();
    dryGain.gain.value = 1 - wet;
    dryGainRef.current = dryGain;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;

    // Connect delay feedback loop
    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayNode);

    // Connect delay to wet gain
    delayNode.connect(wetGain);

    // Mix wet and dry to output
    wetGain.connect(outputGain);
    dryGain.connect(outputGain);

    // Set output ref with all nodes for later parameter updates
    output.current = {
      audioNode: delayNode,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
      _delayNode: delayNode,
      _feedbackGain: feedbackGain,
      _wetGain: wetGain,
      _dryGain: dryGain,
    } as any;

    // Cleanup
    return () => {
      delayNode.disconnect();
      feedbackGain.disconnect();
      wetGain.disconnect();
      dryGain.disconnect();
      outputGain.disconnect();
      output.current = null;
      delayNodeRef.current = null;
      feedbackGainRef.current = null;
      wetGainRef.current = null;
      dryGainRef.current = null;
    };
  }, [audioContext, label]);

  // Handle input connection
  useEffect(() => {
    if (!input.current || !delayNodeRef.current || !dryGainRef.current) return;

    const currentInput = input.current;
    const delayNode = delayNodeRef.current;
    const dryGain = dryGainRef.current;

    // Connect input to both dry and delay
    currentInput.gain.connect(dryGain);
    currentInput.gain.connect(delayNode);

    return () => {
      if (currentInput && dryGain && delayNode) {
        try {
          currentInput.gain.disconnect(dryGain);
          currentInput.gain.disconnect(delayNode);
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [inputKey]);

  // Update time when it changes
  useEffect(() => {
    const stream = output.current as any;
    if (stream?._delayNode) {
      stream._delayNode.delayTime.value = time;
    }
  }, [time, output]);

  // Update feedback when it changes
  useEffect(() => {
    const stream = output.current as any;
    if (stream?._feedbackGain) {
      stream._feedbackGain.gain.value = feedback;
    }
  }, [feedback, output]);

  // Update wet/dry mix when it changes
  useEffect(() => {
    const stream = output.current as any;
    if (stream?._wetGain && stream?._dryGain) {
      stream._wetGain.gain.value = wet;
      stream._dryGain.gain.value = 1 - wet;
    }
  }, [wet, output]);

  // Render children with state
  if (children) {
    return <>{children({
      time,
      setTime,
      feedback,
      setFeedback,
      wet,
      setWet,
      isActive: !!output.current,
    })}</>;
  }

  return null;
};
