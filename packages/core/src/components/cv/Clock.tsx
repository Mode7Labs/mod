import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

// Inline worklet to generate clock pulses on the audio thread.
const CLOCK_WORKLET = `
class ClockPulseProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'bpm', defaultValue: 120, minValue: 1, maxValue: 999 },
      { name: 'running', defaultValue: 0, minValue: 0, maxValue: 1 },
    ];
  }

  constructor() {
    super();
    this._phase = 0;
    this._lastRunning = 0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (!output || output.length === 0) return true;
    const channel = output[0];
    if (!channel) return true;

    const bpmParam = parameters.bpm;
    const runningParam = parameters.running;
    const pulseWidthSamples = Math.max(1, Math.round(sampleRate * 0.01)); // 10ms pulse

    const bpmIsConstant = bpmParam.length === 1;
    const runningIsConstant = runningParam.length === 1;
    const bpmValue = bpmIsConstant ? bpmParam[0] : 120;
    const runningValue = runningIsConstant ? runningParam[0] : 0;
    const samplesPerPulse = bpmIsConstant
      ? Math.max(1, Math.round(sampleRate * 60 / (Math.max(1e-6, bpmValue) * 16)))
      : 0;

    for (let i = 0; i < channel.length; i++) {
      const bpm = bpmIsConstant ? bpmValue : bpmParam[i];
      const running = runningIsConstant ? runningValue : runningParam[i];

      if (running <= 0) {
        channel[i] = 0;
        this._phase = 0;
        this._lastRunning = running;
        continue;
      }

      if (this._lastRunning <= 0 && running > 0) {
        this._phase = 0;
      }

      const period = bpmIsConstant
        ? samplesPerPulse
        : Math.max(1, Math.round(sampleRate * 60 / (Math.max(1e-6, bpm) * 16)));
      const phase = this._phase % period;
      channel[i] = phase < pulseWidthSamples ? 1 : 0;
      this._phase += 1;
      this._lastRunning = running;
    }

    return true;
  }
}

registerProcessor('clock-pulse', ClockPulseProcessor);
`;

const clockWorkletLoaders = new WeakMap<AudioContext, Promise<void>>();
const clockWorkletUrls = new WeakMap<AudioContext, string>();

const loadClockWorklet = (audioContext: AudioContext) => {
  let loader = clockWorkletLoaders.get(audioContext);
  if (!loader) {
    const blob = new Blob([CLOCK_WORKLET], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    clockWorkletUrls.set(audioContext, url);
    loader = audioContext.audioWorklet.addModule(url).then(() => {
      const loadedUrl = clockWorkletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        clockWorkletUrls.delete(audioContext);
      }
    }).catch((err) => {
      const loadedUrl = clockWorkletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        clockWorkletUrls.delete(audioContext);
      }
      clockWorkletLoaders.delete(audioContext);
      throw err;
    });
    clockWorkletLoaders.set(audioContext, loader);
  }
  return loader;
};

export interface ClockHandle {
  start: () => void;
  stop: () => void;
  reset: () => void;
  getState: () => {
    bpm: number;
    isRunning: boolean;
  };
}

export interface ClockRenderProps {
  bpm: number;
  setBpm: (value: number) => void;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export interface ClockProps {
  output: ModStreamRef;
  startOutput?: ModStreamRef;
  label?: string;
  // Controlled props
  bpm?: number;
  onBpmChange?: (bpm: number) => void;
  // Event callbacks
  onRunningChange?: (isRunning: boolean) => void;
  // Render props
  children?: (props: ClockRenderProps) => ReactNode;
}

export const Clock = React.forwardRef<ClockHandle, ClockProps>(({
  output,
  startOutput,
  label = 'clock',
  bpm: controlledBpm,
  onBpmChange,
  onRunningChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [bpm, setBpm] = useControlledState(controlledBpm, 120, onBpmChange);
  const [isRunning, setIsRunning] = useState(false);

  const constantSourceRef = useRef<ConstantSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startSourceRef = useRef<ConstantSourceNode | null>(null);
  const startGainRef = useRef<GainNode | null>(null);
  const bpmRef = useRef(bpm);
  const isRunningRef = useRef(isRunning);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  // Create clock output once
  useEffect(() => {
    if (!audioContext) return;

    const constantSource = audioContext.createConstantSource();
    constantSource.offset.value = 0;
    constantSourceRef.current = constantSource;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;
    gainNodeRef.current = gainNode;

    constantSource.connect(gainNode);
    constantSource.start(0);

    output.current = {
      audioNode: constantSource,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'cv',
      },
    };

    if (startOutput) {
      const startSource = audioContext.createConstantSource();
      startSource.offset.value = 0;
      startSourceRef.current = startSource;

      const startGain = audioContext.createGain();
      startGain.gain.value = 1.0;
      startGainRef.current = startGain;

      startSource.connect(startGain);
      startSource.start(0);

      startOutput.current = {
        audioNode: startSource,
        gain: startGain,
        context: audioContext,
        metadata: {
          label: `${label}-start`,
          sourceType: 'cv',
        },
      };
    }

    if (!audioContext.audioWorklet || typeof AudioWorkletNode === 'undefined') {
      console.error('AudioWorklet not supported in this environment.');
    } else {
      loadClockWorklet(audioContext).then(() => {
        const node = new AudioWorkletNode(audioContext, 'clock-pulse', {
          numberOfInputs: 0,
          numberOfOutputs: 1,
          outputChannelCount: [1],
          parameterData: {
            bpm: bpmRef.current,
            running: isRunningRef.current ? 1 : 0,
          },
        });
        node.connect(constantSource.offset);
        workletNodeRef.current = node;
      }).catch((err) => {
        console.error('Failed to load clock worklet', err);
      });
    }

    return () => {
      constantSource.stop();
      constantSource.disconnect();
      gainNode.disconnect();
      output.current = null;
      constantSourceRef.current = null;
      gainNodeRef.current = null;
      if (workletNodeRef.current) {
        try { workletNodeRef.current.disconnect(); } catch (e) {}
        workletNodeRef.current = null;
      }
      if (startSourceRef.current) {
        startSourceRef.current.stop();
        startSourceRef.current.disconnect();
        startSourceRef.current = null;
      }
      if (startGainRef.current) {
        startGainRef.current.disconnect();
        startGainRef.current = null;
      }
      if (startOutput) {
        startOutput.current = null;
      }
    };
  }, [audioContext, label, startOutput]);

  const start = () => {
    if (isRunning || !audioContext || !constantSourceRef.current) return;
    setIsRunning(true);
    if (startSourceRef.current) {
      startSourceRef.current.offset.setValueAtTime(1, audioContext.currentTime);
    }
    const runningParam = workletNodeRef.current?.parameters.get('running');
    runningParam?.setValueAtTime(1, audioContext.currentTime);
  };

  const stop = () => {
    if (!isRunning) return;
    setIsRunning(false);
    if (!audioContext) return;

    if (constantSourceRef.current && audioContext) {
      constantSourceRef.current.offset.setValueAtTime(0, audioContext.currentTime);
    }
    if (startSourceRef.current && audioContext) {
      startSourceRef.current.offset.setValueAtTime(0, audioContext.currentTime);
    }
    const runningParam = workletNodeRef.current?.parameters.get('running');
    runningParam?.setValueAtTime(0, audioContext.currentTime);
  };

  const reset = () => {
    stop();
  };

  useEffect(() => {
    if (!audioContext) return;
    const bpmParam = workletNodeRef.current?.parameters.get('bpm');
    bpmParam?.setValueAtTime(bpm, audioContext.currentTime);
  }, [bpm, audioContext]);

  useEffect(() => {
    if (!audioContext) return;
    const runningParam = workletNodeRef.current?.parameters.get('running');
    runningParam?.setValueAtTime(isRunning ? 1 : 0, audioContext.currentTime);
  }, [isRunning, audioContext]);

  useImperativeHandle(ref, () => ({
    start,
    stop,
    reset,
    getState: () => ({ bpm, isRunning }),
  }), [bpm, isRunning]);

  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  if (children) {
    return <>{children({
      bpm,
      setBpm,
      isRunning,
      start,
      stop,
      reset,
    })}</>;
  }

  return null;
});

Clock.displayName = 'Clock';
