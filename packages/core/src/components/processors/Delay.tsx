import { useEffect, useState, ReactNode } from 'react';
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

  // Only recreate when specific input stream changes, not refs
  const inputKey = input.current?.audioNode ? String(input.current.audioNode) : 'null';

  // Create nodes once
  useEffect(() => {
    if (!audioContext || !input.current) return;

    // Create delay node
    const delayNode = audioContext.createDelay(5.0);
    delayNode.delayTime.value = time;

    // Create feedback gain
    const feedbackGain = audioContext.createGain();
    feedbackGain.gain.value = feedback;

    // Create wet/dry mix
    const wetGain = audioContext.createGain();
    wetGain.gain.value = wet;

    const dryGain = audioContext.createGain();
    dryGain.gain.value = 1 - wet;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;

    // Connect input to both dry and delay
    input.current.gain.connect(dryGain);
    input.current.gain.connect(delayNode);

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
    };
  }, [audioContext, label, inputKey]);

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
