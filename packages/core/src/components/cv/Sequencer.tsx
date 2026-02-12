import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';
import { getWorkletUrl } from '../../workletUrl';

export interface step {
  active: boolean;
  value: number;
  lengthPct: number;
  slide: boolean;
  accent: boolean;
}

export interface SequencerHandle {
  reset: () => void;
  getState: () => {
    steps: step[];
    currentStep: number;
    division: number;
    length: number;
    swing: number;
  };
}

export interface SequencerRenderProps {
  steps: step[];
  setSteps: (steps: step[]) => void;
  currentStep: number;
  division: number;
  setDivision: (value: number) => void;
  length: number;
  setLength: (value: number) => void;
  swing: number;
  setSwing: (value: number) => void;
  reset: () => void;
}

export interface SequencerProps {
  output: ModStreamRef;
  gateOutput?: ModStreamRef; // Optional separate gate/trigger output
  accentOutput?: ModStreamRef; // Optional accent CV output
  clock?: ModStreamRef;
  reset?: ModStreamRef;
  label?: string;
  numSteps?: number;
  // Controlled props
  steps?: step[];
  onStepsChange?: (steps: step[]) => void;
  division?: number;
  onDivisionChange?: (division: number) => void;
  length?: number;
  onLengthChange?: (length: number) => void;
  swing?: number;
  onSwingChange?: (swing: number) => void;
  // Event callbacks
  onCurrentStepChange?: (currentStep: number) => void;
  // Render props
  children?: (props: SequencerRenderProps) => ReactNode;
}

const sequencerWorkletLoaders = new WeakMap<AudioContext, Promise<void>>();

const loadSequencerWorklet = (audioContext: AudioContext) => {
  let loader = sequencerWorkletLoaders.get(audioContext);
  if (!loader) {
    const url = getWorkletUrl('sequencer-worklet.js');
    loader = audioContext.audioWorklet.addModule(url).catch((err) => {
      sequencerWorkletLoaders.delete(audioContext);
      throw err;
    });
    sequencerWorkletLoaders.set(audioContext, loader);
  }
  return loader;
};

export const Sequencer = React.forwardRef<SequencerHandle, SequencerProps>(({
  output,
  gateOutput,
  accentOutput,
  clock,
  reset: resetInput,
  label = 'sequencer',
  numSteps = 8,
  steps: controlledSteps,
  onStepsChange,
  division: controlledDivision,
  onDivisionChange,
  length: controlledLength,
  onLengthChange,
  swing: controlledSwing,
  onSwingChange,
  onCurrentStepChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const initialSteps: step[] = [];
  for (let i = 0; i < numSteps ; i++) {
    initialSteps.push({ active: false, value: 0, lengthPct: 80, slide: false, accent: false });
  }
  const [steps, setSteps] = useControlledState(controlledSteps, initialSteps, onStepsChange);
  const [currentStep, setCurrentStep] = useState(0);
  const [division, setDivision] = useControlledState(controlledDivision, 4, onDivisionChange);
  const [length, setLength] = useControlledState(controlledLength, numSteps, onLengthChange);
  const [swing, setSwing] = useControlledState(controlledSwing, 0, onSwingChange);
  const [isWorkletReady, setIsWorkletReady] = useState(false);

  const workletRef = useRef<AudioWorkletNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const gateGainRef = useRef<GainNode | null>(null);
  const accentGainRef = useRef<GainNode | null>(null);

  const clampLengthPct = (value: number | undefined) => {
    if (!Number.isFinite(value)) {
      return 80;
    }
    return Math.max(10, Math.min(100, value as number));
  };

  const normalizeStep = (input: step | undefined) => ({
    active: input?.active ?? false,
    value: input?.value ?? 0,
    lengthPct: clampLengthPct(input?.lengthPct),
    slide: input?.slide ?? false,
    accent: input?.accent ?? false,
  });

  const normalizeSteps = (nextLength: number, current: step[]) => {
    const clampedLength = Math.max(1, Math.min(32, nextLength));
    const nextSteps = current.slice(0, clampedLength).map((step) => normalizeStep(step));
    while (nextSteps.length < clampedLength) {
      nextSteps.push({ active: false, value: 0, lengthPct: 80, slide: false, accent: false });
    }
    return nextSteps;
  };

  useEffect(() => {
    const normalized = normalizeSteps(length, steps);
    const needsUpdate = normalized.length !== steps.length
      || normalized.some((step, index) => {
        const current = steps[index];
        if (!current) {
          return true;
        }
        return (
          step.active !== current.active
          || step.value !== current.value
          || step.lengthPct !== current.lengthPct
          || step.slide !== current.slide
          || step.accent !== current.accent
        );
      });
    if (needsUpdate) {
      setSteps(normalized);
    }
    if (currentStep >= normalized.length) {
      const nextStep = normalized.length > 0 ? (currentStep % normalized.length) : 0;
      setCurrentStep(nextStep);
    }
  }, [length, steps, setSteps, currentStep]);

  useEffect(() => {
    if (!audioContext) return;
    let cancelled = false;

    loadSequencerWorklet(audioContext).then(() => {
      if (cancelled) return;
      const node = new AudioWorkletNode(audioContext, 'sequencer-worklet', {
        numberOfInputs: 2,
        numberOfOutputs: 3,
        outputChannelCount: [1, 1, 1],
        channelCount: 1,
        channelCountMode: 'explicit',
      });
      workletRef.current = node;

      const cvGain = audioContext.createGain();
      cvGain.gain.value = 1.0;
      outputGainRef.current = cvGain;
      node.connect(cvGain, 0, 0);

      const gateGain = audioContext.createGain();
      gateGain.gain.value = 1.0;
      gateGainRef.current = gateGain;
      node.connect(gateGain, 1, 0);

      const accentGain = audioContext.createGain();
      accentGain.gain.value = 1.0;
      accentGainRef.current = accentGain;
      node.connect(accentGain, 2, 0);

      output.current = {
        audioNode: cvGain,
        gain: cvGain,
        context: audioContext,
        metadata: {
          label,
          sourceType: 'cv',
        },
      };

      if (gateOutput) {
        gateOutput.current = {
          audioNode: gateGain,
          gain: gateGain,
          context: audioContext,
          metadata: {
            label: `${label}-gate`,
            sourceType: 'cv',
          },
        };
      }

      if (accentOutput) {
        accentOutput.current = {
          audioNode: accentGain,
          gain: accentGain,
          context: audioContext,
          metadata: {
            label: `${label}-accent`,
            sourceType: 'cv',
          },
        };
      }

      node.port.onmessage = (event) => {
        if (event.data?.type === 'step') {
          setCurrentStep(event.data.currentStep ?? 0);
        }
      };

      node.port.postMessage({
        type: 'state',
        steps: normalizeSteps(length, steps),
        length,
        division,
        swing,
        slideTime: 0.065,
        baseGateSeconds: 0.05,
      });
      setIsWorkletReady(true);
    }).catch((err) => {
      if (cancelled) return;
      console.error('Failed to load sequencer worklet', err);
    });

    return () => {
      cancelled = true;
      if (workletRef.current) {
        workletRef.current.port.onmessage = null;
        try { workletRef.current.disconnect(); } catch (e) {}
        workletRef.current = null;
      }
      if (outputGainRef.current) {
        outputGainRef.current.disconnect();
        outputGainRef.current = null;
      }
      if (gateGainRef.current) {
        gateGainRef.current.disconnect();
        gateGainRef.current = null;
      }
      if (accentGainRef.current) {
        accentGainRef.current.disconnect();
        accentGainRef.current = null;
      }
      output.current = null;
      if (gateOutput) {
        gateOutput.current = null;
      }
      if (accentOutput) {
        accentOutput.current = null;
      }
      setIsWorkletReady(false);
    };
  }, [audioContext, label, gateOutput, accentOutput]);

  useEffect(() => {
    if (!workletRef.current) return;
    workletRef.current.port.postMessage({
      type: 'steps',
      steps: normalizeSteps(length, steps),
      length,
    });
  }, [steps, length]);

  useEffect(() => {
    if (!workletRef.current) return;
    workletRef.current.port.postMessage({
      type: 'division',
      value: division,
    });
  }, [division]);

  useEffect(() => {
    if (!workletRef.current) return;
    workletRef.current.port.postMessage({
      type: 'swing',
      value: swing,
    });
  }, [swing]);

  const clockKey = clock?.current?.audioNode ? String(clock.current.audioNode) : 'null';
  useEffect(() => {
    if (!clock?.current || !workletRef.current || !isWorkletReady) return;
    const inGain = clock.current.gain;
    const node = workletRef.current;
    inGain.connect(node, 0, 0);
    return () => {
      try { inGain.disconnect(node); } catch (e) {}
    };
  }, [clockKey, isWorkletReady]);

  const resetKey = resetInput?.current?.audioNode ? String(resetInput.current.audioNode) : 'null';
  useEffect(() => {
    if (!resetInput?.current || !workletRef.current || !isWorkletReady) return;
    const inGain = resetInput.current.gain;
    const node = workletRef.current;
    inGain.connect(node, 0, 1);
    return () => {
      try { inGain.disconnect(node); } catch (e) {}
    };
  }, [resetKey, isWorkletReady]);

  const resetSequence = () => {
    setCurrentStep(0);
    if (workletRef.current) {
      workletRef.current.port.postMessage({ type: 'reset' });
    }
  };

  useImperativeHandle(ref, () => ({
    reset: resetSequence,
    getState: () => ({ steps, currentStep, division, length, swing }),
  }), [steps, currentStep, division, length, swing]);

  useEffect(() => {
    onCurrentStepChange?.(currentStep);
  }, [currentStep, onCurrentStepChange]);

  if (children) {
    return <>{children({
      steps,
      setSteps,
      currentStep,
      division,
      setDivision,
      length,
      setLength,
      swing,
      setSwing,
      reset: resetSequence,
    })}</>;
  }

  return null;
});

Sequencer.displayName = 'Sequencer';
