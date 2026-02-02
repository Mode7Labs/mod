import React, { useEffect, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface VCAHandle {
  getState: () => {
    gain: number;
    enabled: boolean;
  };
}

export interface VCARenderProps {
  gain: number;
  setGain: (value: number) => void;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  isActive: boolean;
}

export interface VCAProps {
  input: ModStreamRef;
  output: ModStreamRef;
  label?: string;
  gain?: number;
  onGainChange?: (gain: number) => void;
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  // CV inputs
  cv?: ModStreamRef;
  cvAmount?: number;
  children?: (props: VCARenderProps) => ReactNode;
}

export const VCA = React.forwardRef<VCAHandle, VCAProps>(({
  input,
  output,
  label = 'vca',
  gain: controlledGain,
  onGainChange,
  enabled: controlledEnabled,
  onEnabledChange,
  cv,
  cvAmount = 1.0,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [gain, setGain] = useControlledState(controlledGain, 0.0, onGainChange);
  const [enabled, setEnabled] = useControlledState(controlledEnabled, true, onEnabledChange);

  const gainNodeRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);
  const cvGainRef = useRef<GainNode | null>(null);
  const bypassConnectionRef = useRef<boolean>(false);

  // Only recreate when specific input stream changes, not refs
  const inputKey = input.current?.audioNode ? String(input.current.audioNode) : 'null';

  // Create nodes once
  useEffect(() => {
    if (!audioContext) return;

    // Create main gain node (VCA)
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    // Create output gain
    const outputGain = audioContext.createGain();
    outputGain.gain.value = 1.0;
    outputGainRef.current = outputGain;

    // Connect gain to output gain
    gainNode.connect(outputGain);

    // Set output ref
    output.current = {
      audioNode: gainNode,
      gain: outputGain,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'processor',
      },
      _gainNode: gainNode,
    } as any;

    // Cleanup
    return () => {
      gainNode.disconnect();
      outputGain.disconnect();
      output.current = null;
      gainNodeRef.current = null;
      outputGainRef.current = null;
      if (cvGainRef.current) {
        cvGainRef.current.disconnect();
        cvGainRef.current = null;
      }
    };
  }, [audioContext, label]);

  // Handle input connection and bypass routing
  useEffect(() => {
    if (!input.current || !gainNodeRef.current || !outputGainRef.current) return;

    const inputGain = input.current.gain;
    const gainNode = gainNodeRef.current;
    const outputGain = outputGainRef.current;

    if (enabled) {
      // Normal mode: input → gain → output
      if (bypassConnectionRef.current) {
        try {
          inputGain.disconnect(outputGain);
        } catch (e) {
          // Already disconnected
        }
        bypassConnectionRef.current = false;
      }
      inputGain.connect(gainNode);
    } else {
      // Bypass mode: input → output (skip gain processing)
      try {
        inputGain.disconnect(gainNode);
      } catch (e) {
        // Already disconnected
      }
      inputGain.connect(outputGain);
      bypassConnectionRef.current = true;
    }

    return () => {
      try {
        if (bypassConnectionRef.current) {
          inputGain.disconnect(outputGain);
        } else {
          inputGain.disconnect(gainNode);
        }
      } catch (e) {
        // Already disconnected
      }
    };
  }, [inputKey, enabled]);

  // Handle CV input connection for gain modulation
  useEffect(() => {
    if (!cv?.current || !gainNodeRef.current || !audioContext) return;

    // Create a gain node to scale the CV signal
    const cvGain = audioContext.createGain();
    cvGain.gain.value = cvAmount;
    cvGainRef.current = cvGain;

    // Connect CV to gain parameter via gain
    cv.current.gain.connect(cvGain);
    cvGain.connect(gainNodeRef.current.gain);

    return () => {
      if (cvGain && cv.current) {
        try {
          cv.current.gain.disconnect(cvGain);
          cvGain.disconnect();
        } catch (e) {
          // Already disconnected
        }
      }
    };
  }, [cv?.current?.audioNode ? String(cv.current.audioNode) : 'null', cvAmount]);

  // Update gain when it changes (base value)
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Update CV amount when it changes
  useEffect(() => {
    if (cvGainRef.current) {
      cvGainRef.current.gain.value = cvAmount;
    }
  }, [cvAmount]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getState: () => ({ gain, enabled }),
  }), [gain, enabled]);

  // Render children with state
  if (children) {
    return <>{children({
      gain,
      setGain,
      enabled,
      setEnabled,
      isActive: !!output.current,
    })}</>;
  }

  return null;
});

VCA.displayName = 'VCA';
