import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface SequencerHandle {
  play: () => void;
  pause: () => void;
  reset: () => void;
  getState: () => {
    steps: number[];
    currentStep: number;
    bpm: number;
    isPlaying: boolean;
  };
}

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
  // Controlled props
  steps?: number[];
  onStepsChange?: (steps: number[]) => void;
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  // Event callbacks
  onCurrentStepChange?: (currentStep: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
  // Render props
  children?: (props: SequencerRenderProps) => ReactNode;
}

export const Sequencer = React.forwardRef<SequencerHandle, SequencerProps>(({
  output,
  gateOutput: _gateOutput,
  label = 'sequencer',
  numSteps = 8,
  steps: controlledSteps,
  onStepsChange,
  bpm: controlledBpm,
  onBpmChange,
  onCurrentStepChange,
  onPlayingChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [steps, setSteps] = useControlledState(controlledSteps, Array(numSteps).fill(0.5), onStepsChange);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useControlledState(controlledBpm, 120, onBpmChange);
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

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    play,
    pause,
    reset,
    getState: () => ({ steps, currentStep, bpm, isPlaying }),
  }), [steps, currentStep, bpm, isPlaying]);

  // Event callback effects
  useEffect(() => {
    onCurrentStepChange?.(currentStep);
  }, [currentStep, onCurrentStepChange]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

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
});

Sequencer.displayName = 'Sequencer';
