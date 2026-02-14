import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';
import { sequencerWorklet } from '../../worklets';

export interface Step {
  active: boolean;
  value: number;
  lengthPct: number;
  slide: boolean;
  accent: boolean;
}

export interface SequencerHandle {
  reset: () => void;
  getState: () => {
    steps: Step[];
    currentStep: number;
    division: number;
    length: number;
    swing: number;
  };
}

export interface SequencerRenderProps {
  steps: Step[];
  setSteps: (steps: Step[]) => void;
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
  steps?: Step[];
  onStepsChange?: (steps: Step[]) => void;
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
const sequencerWorkletUrls = new WeakMap<AudioContext, string>();

const loadSequencerWorklet = (audioContext: AudioContext) => {
  let loader = sequencerWorkletLoaders.get(audioContext);
  if (!loader) {
    const blob = new Blob([sequencerWorklet], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    sequencerWorkletUrls.set(audioContext, url);
    loader = audioContext.audioWorklet.addModule(url).then(() => {
      const loadedUrl = sequencerWorkletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        sequencerWorkletUrls.delete(audioContext);
      }
    }).catch((err) => {
      const loadedUrl = sequencerWorkletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        sequencerWorkletUrls.delete(audioContext);
      }
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
  const initialSteps: Step[] = [];
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
  const keepAliveGainRef = useRef<GainNode | null>(null);

  const clampLengthPct = (value: number | undefined) => {
    if (!Number.isFinite(value)) {
      return 80;
    }
    return Math.max(10, Math.min(100, value as number));
  };

  const normalizeStep = (input: Step | undefined) => ({
    active: input?.active ?? false,
    value: input?.value ?? 0,
    lengthPct: clampLengthPct(input?.lengthPct),
    slide: input?.slide ?? false,
    accent: input?.accent ?? false,
  });

  const normalizeSteps = (nextLength: number, current: Step[]) => {
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
    let workletNode: AudioWorkletNode | null = null;
    let keepAlive: GainNode | null = null;

    const cvGain = audioContext.createGain();
    cvGain.gain.value = 1.0;
    outputGainRef.current = cvGain;

    const gateGain = audioContext.createGain();
    gateGain.gain.value = 1.0;
    gateGainRef.current = gateGain;

    const accentGain = audioContext.createGain();
    accentGain.gain.value = 1.0;
    accentGainRef.current = accentGain;

    const assignOutputs = () => {
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
    };

    assignOutputs();

    const createWorklet = async () => {
      if (!audioContext.audioWorklet || typeof AudioWorkletNode === 'undefined') {
        return;
      }
      try {
        await loadSequencerWorklet(audioContext);
        if (cancelled) return;
        if (workletNode) return;
        const node = new AudioWorkletNode(audioContext, 'sequencer-worklet', {
          numberOfInputs: 2,
          numberOfOutputs: 3,
          outputChannelCount: [1, 1, 1],
          channelCount: 1,
          channelCountMode: 'explicit',
        });
        workletNode = node;
        workletRef.current = node;

        node.connect(cvGain, 0, 0);
        node.connect(gateGain, 1, 0);
        node.connect(accentGain, 2, 0);

        keepAlive = audioContext.createGain();
        keepAlive.gain.value = 0;
        keepAliveGainRef.current = keepAlive;
        node.connect(keepAlive);
        keepAlive.connect(audioContext.destination);

        const port = node.port;
        if (port) {
          port.onmessage = (event) => {
            if (event.data?.type === 'step') {
              setCurrentStep(event.data.currentStep ?? 0);
            }
          };

          port.postMessage({
            type: 'state',
            steps: normalizeSteps(length, steps),
            length,
            division,
            swing,
            slideTime: 0.065,
            baseGateSeconds: 0.05,
          });
        }

        setIsWorkletReady(true);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load sequencer worklet', err);
      }
    };

    createWorklet();

    return () => {
      cancelled = true;
      setIsWorkletReady(false);
      if (workletRef.current) {
        if (workletRef.current.port) {
          workletRef.current.port.onmessage = null;
        }
        try { workletRef.current.disconnect(); } catch (e) {}
        workletRef.current = null;
      }
      if (keepAliveGainRef.current) {
        keepAliveGainRef.current.disconnect();
        keepAliveGainRef.current = null;
      }
      if (cvGain) {
        try { cvGain.disconnect(); } catch (e) {}
        outputGainRef.current = null;
      }
      if (gateGain) {
        try { gateGain.disconnect(); } catch (e) {}
        gateGainRef.current = null;
      }
      if (accentGain) {
        try { accentGain.disconnect(); } catch (e) {}
        accentGainRef.current = null;
      }
      keepAlive = null;
      output.current = null;
      if (gateOutput) {
        gateOutput.current = null;
      }
      if (accentOutput) {
        accentOutput.current = null;
      }
    };
  }, [audioContext, label, gateOutput, accentOutput]);

  useEffect(() => {
    const port = workletRef.current?.port;
    if (!port) return;
    port.postMessage({
      type: 'steps',
      steps: normalizeSteps(length, steps),
      length,
    });
  }, [steps, length]);

  useEffect(() => {
    const port = workletRef.current?.port;
    if (!port) return;
    port.postMessage({
      type: 'division',
      value: division,
    });
  }, [division]);

  useEffect(() => {
    const port = workletRef.current?.port;
    if (!port) return;
    port.postMessage({
      type: 'swing',
      value: swing,
    });
  }, [swing]);

  const clockNode = workletRef.current;
  useEffect(() => {
    if (!clock || !isWorkletReady || !clockNode) return;

    let rafId: number | null = null;
    let connectedGain: GainNode | null = null;
    let cancelled = false;

    const attemptConnect = () => {
      if (cancelled || !clockNode) return;
      const inGain = clock.current?.gain;
      if (!inGain) {
        rafId = requestAnimationFrame(attemptConnect);
        return;
      }
      connectedGain = inGain;
      inGain.connect(clockNode, 0, 0);
    };

    attemptConnect();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (connectedGain && clockNode) {
        try { connectedGain.disconnect(clockNode); } catch (e) {}
      }
    };
  }, [clock, isWorkletReady, clockNode]);

  const resetNode = workletRef.current;
  useEffect(() => {
    if (!resetInput || !isWorkletReady || !resetNode) return;

    let rafId: number | null = null;
    let connectedGain: GainNode | null = null;
    let cancelled = false;

    const attemptConnect = () => {
      if (cancelled || !resetNode) return;
      const inGain = resetInput.current?.gain;
      if (!inGain) {
        rafId = requestAnimationFrame(attemptConnect);
        return;
      }
      connectedGain = inGain;
      inGain.connect(resetNode, 0, 1);
    };

    attemptConnect();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (connectedGain && resetNode) {
        try { connectedGain.disconnect(resetNode); } catch (e) {}
      }
    };
  }, [resetInput, isWorkletReady, resetNode]);

  const resetSequence = () => {
    setCurrentStep(0);
    const port = workletRef.current?.port;
    if (port) {
      port.postMessage({ type: 'reset' });
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
