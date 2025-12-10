import React, { useEffect, useRef, ReactNode, useImperativeHandle, useState } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

// ============================================
// Type Definitions
// ============================================

export type VoiceStealingMode = 'oldest' | 'quietest' | 'none';
export type GateMode = 'gate' | 'trigger';

export interface TriggerOptions {
  velocity?: number;      // 0-1, affects voice gain (default: 1)
  startOffset?: number;   // Start position in seconds (default: 0)
  playbackRate?: number;  // Override default playbackRate
  detune?: number;        // Override default detune
  loop?: boolean;         // Override default loop setting
}

export interface SamplerState {
  playbackRate: number;
  detune: number;
  gain: number;
  loop: boolean;
  loopStart: number;
  loopEnd: number;
  enabled: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  activeVoices: number;
  duration: number;
  error: string | null;
}

export interface SamplerHandle {
  trigger: (options?: TriggerOptions) => string | null;
  triggerNote: (midiNote: number, options?: Omit<TriggerOptions, 'playbackRate'>) => string | null;
  stop: (voiceId?: string) => void;
  stopAll: () => void;
  loadFile: (file: File) => Promise<void>;
  loadUrl: (url: string) => Promise<void>;
  loadBuffer: (buffer: ArrayBuffer) => Promise<void>;
  getState: () => SamplerState;
}

export interface SamplerRenderProps {
  // Loading
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  sampleRate: number | null;
  numberOfChannels: number | null;

  // Playback
  isPlaying: boolean;
  activeVoices: number;
  maxPolyphony: number;
  trigger: (options?: TriggerOptions) => string | null;
  triggerNote: (midiNote: number, options?: Omit<TriggerOptions, 'playbackRate'>) => string | null;
  stop: (voiceId?: string) => void;
  stopAll: () => void;

  // Sample loading
  loadFile: (file: File) => void;
  loadUrl: (url: string) => void;

  // Parameters
  playbackRate: number;
  setPlaybackRate: (value: number) => void;
  detune: number;
  setDetune: (value: number) => void;
  gain: number;
  setGain: (value: number) => void;
  loop: boolean;
  setLoop: (value: boolean) => void;
  loopStart: number;
  setLoopStart: (value: number) => void;
  loopEnd: number;
  setLoopEnd: (value: number) => void;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  cvAmount: number;
  setCvAmount: (value: number) => void;

  isActive: boolean;
}

export interface SamplerProps {
  output: ModStreamRef;
  label?: string;

  // Sample source
  src?: string;
  buffer?: ArrayBuffer;

  // Pitch (controlled)
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
  detune?: number;
  onDetuneChange?: (cents: number) => void;

  // Volume (controlled)
  gain?: number;
  onGainChange?: (gain: number) => void;

  // Looping (controlled)
  loop?: boolean;
  onLoopChange?: (loop: boolean) => void;
  loopStart?: number;
  onLoopStartChange?: (time: number) => void;
  loopEnd?: number;
  onLoopEndChange?: (time: number) => void;

  // Enabled/bypass (controlled)
  enabled?: boolean;
  onEnabledChange?: (enabled: boolean) => void;

  // Polyphony
  maxPolyphony?: number;
  voiceStealingMode?: VoiceStealingMode;

  // Triggering
  gate?: ModStreamRef;
  gateMode?: GateMode;
  rootNote?: number;

  // CV Modulation
  cv?: ModStreamRef;
  cvAmount?: number;
  onCvAmountChange?: (amount: number) => void;
  cvTarget?: 'playbackRate' | 'detune';

  // Callbacks
  onLoad?: (duration: number) => void;
  onLoadStart?: () => void;
  onError?: (error: string) => void;
  onTrigger?: (voiceId: string) => void;
  onEnd?: (voiceId: string) => void;

  children?: (props: SamplerRenderProps) => ReactNode;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Convert MIDI note number to playback rate.
 * Middle C (60) = 1.0, octave up (72) = 2.0, octave down (48) = 0.5
 */
export function midiNoteToPlaybackRate(midiNote: number, rootNote: number = 60): number {
  return Math.pow(2, (midiNote - rootNote) / 12);
}

// ============================================
// Voice Interface (internal)
// ============================================

interface Voice {
  id: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  velocity: number;
}

// ============================================
// Component
// ============================================

export const Sampler = React.forwardRef<SamplerHandle, SamplerProps>(({
  output,
  label = 'sampler',
  src,
  buffer: _bufferProp,
  playbackRate: controlledPlaybackRate,
  onPlaybackRateChange,
  detune: controlledDetune,
  onDetuneChange,
  gain: controlledGain,
  onGainChange,
  loop: controlledLoop,
  onLoopChange,
  loopStart: controlledLoopStart,
  onLoopStartChange,
  loopEnd: controlledLoopEnd,
  onLoopEndChange,
  enabled: controlledEnabled,
  onEnabledChange,
  maxPolyphony = 8,
  voiceStealingMode = 'oldest',
  gate,
  gateMode = 'trigger',
  rootNote = 60,
  cv,
  cvAmount: controlledCvAmount,
  onCvAmountChange,
  cvTarget = 'playbackRate',
  onLoad,
  onLoadStart,
  onError,
  onTrigger,
  onEnd,
  children,
}, ref) => {
  const audioContext = useAudioContext();

  // Controlled state
  const [playbackRate, setPlaybackRate] = useControlledState(controlledPlaybackRate, 1.0, onPlaybackRateChange);
  const [detune, setDetune] = useControlledState(controlledDetune, 0, onDetuneChange);
  const [gain, setGain] = useControlledState(controlledGain, 1.0, onGainChange);
  const [loop, setLoop] = useControlledState(controlledLoop, false, onLoopChange);
  const [loopStart, setLoopStart] = useControlledState(controlledLoopStart, 0, onLoopStartChange);
  const [loopEnd, setLoopEnd] = useControlledState(controlledLoopEnd, 0, onLoopEndChange);
  const [enabled, setEnabled] = useControlledState(controlledEnabled, true, onEnabledChange);
  const [cvAmount, setCvAmount] = useControlledState(controlledCvAmount, 0.5, onCvAmountChange);

  // Internal state
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const [numberOfChannels, setNumberOfChannels] = useState<number | null>(null);
  const [activeVoices, setActiveVoices] = useState(0);

  // Refs
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const voicesRef = useRef<Map<string, Voice>>(new Map());
  const lastVoiceIdRef = useRef<string | null>(null);
  const voiceIdCounterRef = useRef(0);
  const cvGainRef = useRef<GainNode | null>(null);
  const gateAnalyserRef = useRef<AnalyserNode | null>(null);
  const gateIntervalRef = useRef<number | null>(null);
  const lastGateStateRef = useRef(false);

  // Computed
  const isPlaying = activeVoices > 0;

  // Create output gain node
  useEffect(() => {
    if (!audioContext) return;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    output.current = {
      audioNode: gainNode,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'sampler',
      },
    };

    return () => {
      gainNode.disconnect();
      output.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  // Update gain
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Load from src prop
  useEffect(() => {
    if (src && audioContext) {
      loadUrl(src);
    }
  }, [src, audioContext]);

  // Stop all voices when enabled becomes false
  useEffect(() => {
    if (!enabled) {
      stopAllVoices();
    }
  }, [enabled]);

  // Helper to stop all voices (used by enabled effect and stopAll)
  const stopAllVoices = (): void => {
    voicesRef.current.forEach((voice) => {
      try {
        voice.source.stop();
      } catch {
        // Already stopped
      }
    });
    voicesRef.current.clear();
    setActiveVoices(0);
  };

  // Gate input detection
  useEffect(() => {
    if (!gate?.current?.audioNode || !audioContext) return;

    const gateNode = gate.current.audioNode;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0;
    gateAnalyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    gateNode.connect(analyser);

    const checkGate = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Find max amplitude
      let max = 0;
      for (let i = 0; i < bufferLength; i++) {
        const value = Math.abs(dataArray[i] - 128);
        if (value > max) max = value;
      }

      const isGateHigh = max > 20;

      // Rising edge - trigger
      if (isGateHigh && !lastGateStateRef.current) {
        trigger();
      }
      // Falling edge - stop (only in gate mode)
      else if (!isGateHigh && lastGateStateRef.current && gateMode === 'gate') {
        stopAllVoices();
      }

      lastGateStateRef.current = isGateHigh;
    };

    gateIntervalRef.current = window.setInterval(checkGate, 1);

    return () => {
      if (gateIntervalRef.current !== null) {
        clearInterval(gateIntervalRef.current);
        gateIntervalRef.current = null;
      }
      try {
        analyser.disconnect();
      } catch {
        // Already disconnected
      }
      gateAnalyserRef.current = null;
    };
  }, [gate?.current, audioContext, gateMode, enabled, isLoaded]);

  // CV modulation
  useEffect(() => {
    if (!cv?.current || !audioContext) return;

    // CV modulation for Sampler works differently than Filter because
    // AudioBufferSourceNode is created per-voice. We store the CV connection
    // info and apply it to each new voice in trigger().
    const cvGain = audioContext.createGain();
    cvGain.gain.value = cvAmount;
    cvGainRef.current = cvGain;

    // Connect CV source to scaling gain
    cv.current.gain.connect(cvGain);

    return () => {
      if (cvGain && cv.current) {
        try {
          cv.current.gain.disconnect(cvGain);
          cvGain.disconnect();
        } catch {
          // Already disconnected
        }
      }
      cvGainRef.current = null;
    };
  }, [cv?.current, audioContext]);

  // Update CV amount
  useEffect(() => {
    if (cvGainRef.current) {
      cvGainRef.current.gain.value = cvAmount;
    }
  }, [cvAmount]);

  // Generate unique voice ID
  const generateVoiceId = (): string => {
    voiceIdCounterRef.current += 1;
    return `voice-${voiceIdCounterRef.current}`;
  };

  // Trigger function
  const trigger = (options: TriggerOptions = {}): string | null => {
    if (!audioContext || !audioBufferRef.current || !gainNodeRef.current || !enabled) {
      return null;
    }

    const {
      velocity = 1,
      startOffset = 0,
      playbackRate: overrideRate,
      detune: overrideDetune,
      loop: overrideLoop,
    } = options;

    // Clamp velocity
    const clampedVelocity = Math.max(0, Math.min(1, velocity));

    // Check polyphony and handle voice stealing
    if (voicesRef.current.size >= maxPolyphony) {
      if (voiceStealingMode === 'none') {
        return null;
      }

      // Find voice to steal
      const findVoiceToSteal = (): Voice | undefined => {
        const voices = Array.from(voicesRef.current.values());
        if (voices.length === 0) return undefined;

        if (voiceStealingMode === 'oldest') {
          return voices.reduce((oldest, voice) =>
            voice.startTime < oldest.startTime ? voice : oldest
          );
        } else {
          // quietest
          return voices.reduce((quietest, voice) =>
            voice.velocity < quietest.velocity ? voice : quietest
          );
        }
      };

      const voiceToSteal = findVoiceToSteal();
      if (voiceToSteal) {
        try {
          voiceToSteal.source.stop();
        } catch {
          // Already stopped
        }
        voicesRef.current.delete(voiceToSteal.id);
      }
    }

    // Create voice
    const voiceId = generateVoiceId();
    const source = audioContext.createBufferSource();
    const voiceGain = audioContext.createGain();

    source.buffer = audioBufferRef.current;
    source.playbackRate.value = overrideRate ?? playbackRate;
    source.detune.value = overrideDetune ?? detune;
    source.loop = overrideLoop ?? loop;
    source.loopStart = loopStart;
    source.loopEnd = loopEnd;

    voiceGain.gain.value = clampedVelocity;

    source.connect(voiceGain);
    voiceGain.connect(gainNodeRef.current);

    // Connect CV modulation to this voice's target param
    if (cvGainRef.current) {
      const targetParam = cvTarget === 'detune' ? source.detune : source.playbackRate;
      cvGainRef.current.connect(targetParam);
    }

    // Handle voice end
    source.onended = () => {
      voicesRef.current.delete(voiceId);
      setActiveVoices(voicesRef.current.size);
      voiceGain.disconnect();
      onEnd?.(voiceId);
    };

    // Start playback
    source.start(0, startOffset);

    // Track voice
    const voice: Voice = {
      id: voiceId,
      source,
      gainNode: voiceGain,
      startTime: audioContext.currentTime,
      velocity: clampedVelocity,
    };
    voicesRef.current.set(voiceId, voice);
    lastVoiceIdRef.current = voiceId;
    setActiveVoices(voicesRef.current.size);

    onTrigger?.(voiceId);
    return voiceId;
  };

  // Trigger note (MIDI)
  const triggerNote = (
    midiNote: number,
    options: Omit<TriggerOptions, 'playbackRate'> = {}
  ): string | null => {
    const rate = midiNoteToPlaybackRate(midiNote, rootNote);
    return trigger({ ...options, playbackRate: rate });
  };

  // Stop function
  const stop = (voiceId?: string): void => {
    const id = voiceId ?? lastVoiceIdRef.current;
    if (!id) return;

    const voice = voicesRef.current.get(id);
    if (voice) {
      try {
        voice.source.stop();
      } catch {
        // Already stopped
      }
      voicesRef.current.delete(id);
      setActiveVoices(voicesRef.current.size);
    }
  };

  // Stop all voices
  const stopAll = (): void => {
    stopAllVoices();
  };

  // Load from URL
  const loadUrl = async (url: string): Promise<void> => {
    if (!audioContext) return;

    setIsLoading(true);
    setError(null);
    onLoadStart?.();

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      await loadBuffer(arrayBuffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load URL';
      setError(message);
      setIsLoading(false);
      onError?.(message);
    }
  };

  // Load from File
  const loadFile = async (file: File): Promise<void> => {
    if (!audioContext) return;

    setIsLoading(true);
    setError(null);
    onLoadStart?.();

    try {
      const arrayBuffer = await file.arrayBuffer();
      await loadBuffer(arrayBuffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load file';
      setError(message);
      setIsLoading(false);
      onError?.(message);
    }
  };

  // Load from ArrayBuffer
  const loadBuffer = async (buffer: ArrayBuffer): Promise<void> => {
    if (!audioContext) return;

    try {
      const audioBuffer = await audioContext.decodeAudioData(buffer);
      audioBufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      setSampleRate(audioBuffer.sampleRate);
      setNumberOfChannels(audioBuffer.numberOfChannels);
      setIsLoaded(true);
      setIsLoading(false);
      onLoad?.(audioBuffer.duration);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decode audio';
      setError(message);
      setIsLoading(false);
      onError?.(message);
    }
  };

  // Get state
  const getState = (): SamplerState => ({
    playbackRate,
    detune,
    gain,
    loop,
    loopStart,
    loopEnd,
    enabled,
    isLoaded,
    isLoading,
    isPlaying,
    activeVoices,
    duration,
    error,
  });

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    trigger,
    triggerNote,
    stop,
    stopAll,
    loadFile,
    loadUrl,
    loadBuffer,
    getState,
  }), [audioContext, playbackRate, detune, gain, loop, loopStart, loopEnd, enabled, isLoaded, isLoading, isPlaying, activeVoices, duration, error]);

  // Render
  if (children) {
    return <>{children({
      isLoaded,
      isLoading,
      error,
      duration,
      sampleRate,
      numberOfChannels,
      isPlaying,
      activeVoices,
      maxPolyphony,
      trigger,
      triggerNote,
      stop,
      stopAll,
      loadFile: (file: File) => { loadFile(file); },
      loadUrl: (url: string) => { loadUrl(url); },
      playbackRate,
      setPlaybackRate,
      detune,
      setDetune,
      gain,
      setGain,
      loop,
      setLoop,
      loopStart,
      setLoopStart,
      loopEnd,
      setLoopEnd,
      enabled,
      setEnabled,
      cvAmount,
      setCvAmount,
      isActive: !!output.current,
    })}</>;
  }

  return null;
});

Sampler.displayName = 'Sampler';
