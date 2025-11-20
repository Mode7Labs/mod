import React, { useEffect, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface ADSRHandle {
  trigger: () => void;
  releaseGate: () => void;
  getState: () => {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export interface ADSRRenderProps {
  attack: number;
  setAttack: (value: number) => void;
  decay: number;
  setDecay: (value: number) => void;
  sustain: number;
  setSustain: (value: number) => void;
  release: number;
  setRelease: (value: number) => void;
  trigger: () => void;
  releaseGate: () => void;
  isActive: boolean;
}

export interface ADSRProps {
  gate?: ModStreamRef; // Optional gate input to trigger envelope
  output: ModStreamRef;
  label?: string;
  // Controlled props
  attack?: number;
  onAttackChange?: (attack: number) => void;
  decay?: number;
  onDecayChange?: (decay: number) => void;
  sustain?: number;
  onSustainChange?: (sustain: number) => void;
  release?: number;
  onReleaseChange?: (release: number) => void;
  // Render props
  children?: (props: ADSRRenderProps) => ReactNode;
}

export const ADSR = React.forwardRef<ADSRHandle, ADSRProps>(({
  gate,
  output,
  label = 'adsr',
  attack: controlledAttack,
  onAttackChange,
  decay: controlledDecay,
  onDecayChange,
  sustain: controlledSustain,
  onSustainChange,
  release: controlledRelease,
  onReleaseChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [attack, setAttack] = useControlledState(controlledAttack, 0.01, onAttackChange);
  const [decay, setDecay] = useControlledState(controlledDecay, 0.1, onDecayChange);
  const [sustain, setSustain] = useControlledState(controlledSustain, 0.7, onSustainChange);
  const [release, setRelease] = useControlledState(controlledRelease, 0.3, onReleaseChange);

  const constantSourceRef = useRef<ConstantSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isGateOpenRef = useRef<boolean>(false);

  // Store parameter refs for trigger/release functions
  const attackRef = useRef(attack);
  const decayRef = useRef(decay);
  const sustainRef = useRef(sustain);
  const releaseRef = useRef(release);

  useEffect(() => { attackRef.current = attack; }, [attack]);
  useEffect(() => { decayRef.current = decay; }, [decay]);
  useEffect(() => { sustainRef.current = sustain; }, [sustain]);
  useEffect(() => { releaseRef.current = release; }, [release]);

  // Trigger and release functions
  const triggerEnvelope = useRef<() => void>(() => {});
  const releaseEnvelope = useRef<() => void>(() => {});

  // Create ADSR nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Use ConstantSourceNode to generate a DC signal
    const constantSource = audioContext.createConstantSource();
    constantSource.offset.value = 1;
    constantSourceRef.current = constantSource;

    // Create gain node to shape the envelope
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0; // Start at 0
    gainNodeRef.current = gainNode;

    // Connect constant source to gain
    constantSource.connect(gainNode);

    // Start constant source
    constantSource.start(0);

    // Trigger function
    triggerEnvelope.current = () => {
      if (!gainNode || isGateOpenRef.current) return;
      isGateOpenRef.current = true;

      const now = audioContext.currentTime;
      const a = attackRef.current;
      const d = decayRef.current;
      const s = sustainRef.current;

      // Cancel any ongoing envelope
      gainNode.gain.cancelScheduledValues(now);

      // ADSR Envelope
      gainNode.gain.setValueAtTime(gainNode.gain.value, now); // Start from current value
      gainNode.gain.linearRampToValueAtTime(1.0, now + a); // Attack to peak
      gainNode.gain.linearRampToValueAtTime(s, now + a + d); // Decay to sustain
      // Sustain is held until release
    };

    // Release function
    releaseEnvelope.current = () => {
      if (!gainNode || !isGateOpenRef.current) return;
      isGateOpenRef.current = false;

      const now = audioContext.currentTime;
      const r = releaseRef.current;

      // Cancel scheduled values and release
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + r); // Release to 0
    };

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
      constantSource.stop();
      constantSource.disconnect();
      gainNode.disconnect();
      output.current = null;
      constantSourceRef.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  // Handle gate input connection (optional)
  useEffect(() => {
    if (!gate?.current?.audioNode || !audioContext) return;

    // Check if the gate is a ConstantSourceNode (like Clock output)
    const gateNode = gate.current.audioNode;

    if (gateNode instanceof ConstantSourceNode) {
      // For ConstantSourceNode, use AnalyserNode to detect actual audio values
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Connect gate to analyser
      gateNode.connect(analyser);

      let lastGateState = false;
      let intervalId: number;

      const checkGate = () => {
        analyser.getByteTimeDomainData(dataArray);

        // Find max value in buffer
        let max = 0;
        for (let i = 0; i < bufferLength; i++) {
          const value = Math.abs(dataArray[i] - 128);
          if (value > max) max = value;
        }

        // Detect gate threshold (normalized 0-127, threshold at ~20)
        const isGateHigh = max > 20;

        // Trigger on rising edge (gate goes from low to high)
        if (isGateHigh && !lastGateState) {
          triggerEnvelope.current();
        }
        // Release on falling edge (gate goes from high to low)
        else if (!isGateHigh && lastGateState) {
          releaseEnvelope.current();
        }

        lastGateState = isGateHigh;
      };

      // Check at 1ms intervals (1000 Hz) to catch 10ms pulses
      intervalId = window.setInterval(checkGate, 1);

      return () => {
        clearInterval(intervalId);
        analyser.disconnect();
      };
    } else {
      // For other node types, use AnalyserNode
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128; // Smaller FFT for faster response
      analyser.smoothingTimeConstant = 0; // No smoothing for fast detection
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Connect gate signal to analyser
      gateNode.connect(analyser);

      let lastGateState = false;
      let intervalId: number;

      // Poll very fast (every 1ms) to catch short pulses
      const checkGate = () => {
        analyser.getByteTimeDomainData(dataArray);

        // Find max value in buffer
        let max = 0;
        for (let i = 0; i < bufferLength; i++) {
          const value = Math.abs(dataArray[i] - 128);
          if (value > max) max = value;
        }

        // Detect gate threshold (normalized 0-127, threshold at ~20)
        const isGateHigh = max > 20;

        // Trigger on rising edge
        if (isGateHigh && !lastGateState) {
          triggerEnvelope.current();
        }
        // Release on falling edge
        else if (!isGateHigh && lastGateState) {
          releaseEnvelope.current();
        }

        lastGateState = isGateHigh;
      };

      intervalId = window.setInterval(checkGate, 1);

      return () => {
        clearInterval(intervalId);
        analyser.disconnect();
      };
    }
  }, [gate, gate?.current, gate?.current?.audioNode, audioContext]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    trigger: triggerEnvelope.current,
    releaseGate: releaseEnvelope.current,
    getState: () => ({ attack, decay, sustain, release }),
  }), [attack, decay, sustain, release]);

  // Render children with state
  if (children) {
    return <>{children({
      attack,
      setAttack,
      decay,
      setDecay,
      sustain,
      setSustain,
      release,
      setRelease,
      trigger: triggerEnvelope.current,
      releaseGate: releaseEnvelope.current,
      isActive: !!output.current,
    } as any)}</>;
  }

  return null;
});

ADSR.displayName = 'ADSR';
