import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface SequencerRenderProps {
  steps: number[];
  setSteps: (steps: number[]) => void;
  currentStep: number;
  bpm: number;
  setBpm: (value: number) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export interface SequencerProps {
  output: ModStreamRef;
  gateOutput?: ModStreamRef; // Optional separate gate/trigger output
  label?: string;
  numSteps?: number;
  children?: (props: SequencerRenderProps) => ReactNode;
}

export const Sequencer: React.FC<SequencerProps> = ({
  output,
  gateOutput: _gateOutput,
  label = 'sequencer',
  numSteps = 8,
  children,
}) => {
  const audioContext = useAudioContext();
  const [steps, setSteps] = useState<number[]>(Array(numSteps).fill(0.5)); // Values 0-1
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);

  const constantSourceRef = useRef<ConstantSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Store refs for current state
  const stepsRef = useRef(steps);
  const currentStepRef = useRef(currentStep);
  const bpmRef = useRef(bpm);

  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { currentStepRef.current = currentStep; }, [currentStep]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // Create sequencer nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Use ConstantSourceNode to output CV values
    const constantSource = audioContext.createConstantSource();
    constantSource.offset.value = steps[0] || 0.5;
    constantSourceRef.current = constantSource;

    // Create gain node for output
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;
    gainNodeRef.current = gainNode;

    // Connect constant source to gain
    constantSource.connect(gainNode);

    // Start constant source
    constantSource.start(0);

    // Set output ref
    output.current = {
      audioNode: constantSource,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

    // Cleanup
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      constantSource.stop();
      constantSource.disconnect();
      gainNode.disconnect();
      output.current = null;
      constantSourceRef.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  // Play function
  const play = () => {
    if (isPlaying || !audioContext) return;
    setIsPlaying(true);

    const stepDuration = (60 / bpmRef.current) * 1000; // milliseconds per step

    intervalRef.current = window.setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % stepsRef.current.length;

        // Update the constant source value
        if (constantSourceRef.current) {
          const now = audioContext.currentTime;
          constantSourceRef.current.offset.setValueAtTime(stepsRef.current[nextStep], now);
        }

        return nextStep;
      });
    }, stepDuration);
  };

  // Pause function
  const pause = () => {
    if (!isPlaying) return;
    setIsPlaying(false);

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset function
  const reset = () => {
    pause();
    setCurrentStep(0);
    if (constantSourceRef.current && audioContext) {
      const now = audioContext.currentTime;
      constantSourceRef.current.offset.setValueAtTime(stepsRef.current[0], now);
    }
  };

  // Update interval when BPM changes
  useEffect(() => {
    if (isPlaying && audioContext) {
      // Clear existing interval
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Restart with new BPM
      const stepDuration = (60 / bpmRef.current) * 1000; // milliseconds per step

      intervalRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = (prev + 1) % stepsRef.current.length;

          // Update the constant source value
          if (constantSourceRef.current) {
            const now = audioContext.currentTime;
            constantSourceRef.current.offset.setValueAtTime(stepsRef.current[nextStep], now);
          }

          return nextStep;
        });
      }, stepDuration);
    }
  }, [bpm]);

  // Render children with state
  if (children) {
    return <>{children({
      steps,
      setSteps,
      currentStep,
      bpm,
      setBpm,
      isPlaying,
      play,
      pause,
      reset,
    })}</>;
  }

  return null;
};
