import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';
import { samplerWorklets } from '../../worklets';

const samplerWorkletLoaders = new WeakMap<AudioContext, Promise<void>>();
const samplerWorkletUrls = new WeakMap<AudioContext, string>();

const loadSamplerWorklets = (audioContext: AudioContext) => {
  let loader = samplerWorkletLoaders.get(audioContext);
  if (!loader) {
    const blob = new Blob([samplerWorklets], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    samplerWorkletUrls.set(audioContext, url);
    loader = audioContext.audioWorklet.addModule(url).then(() => {
      const loadedUrl = samplerWorkletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        samplerWorkletUrls.delete(audioContext);
      }
    }).catch((err) => {
      const loadedUrl = samplerWorkletUrls.get(audioContext);
      if (loadedUrl) {
        URL.revokeObjectURL(loadedUrl);
        samplerWorkletUrls.delete(audioContext);
      }
      samplerWorkletLoaders.delete(audioContext);
      throw err;
    });
    samplerWorkletLoaders.set(audioContext, loader);
  }
  return loader;
};

export type PlaybackMode = 'one-shot' | 'gate' | 'loop';

export interface SamplerHandle {
  trigger: () => void;
  stop: () => void;
  loadFile: (file: File) => void;
  getState: () => {
    src: string;
    fileName: string;
    gain: number;
    playbackMode: PlaybackMode;
    startTime: number;
    endTime: number;
    pitch: number;
    isPlaying: boolean;
    isReady: boolean;
    currentTime: number;
    duration: number;
    error: string | null;
  };
}

export interface SamplerRenderProps {
  src: string;
  setSrc: (src: string) => void;
  fileName: string;
  setFileName: (name: string) => void;
  loadFile: (file: File) => void;
  gain: number;
  setGain: (value: number) => void;
  playbackMode: PlaybackMode;
  setPlaybackMode: (value: PlaybackMode) => void;
  startTime: number;
  setStartTime: (value: number) => void;
  endTime: number;
  setEndTime: (value: number) => void;
  pitch: number;
  setPitch: (value: number) => void;
  isPlaying: boolean;
  trigger: () => void;
  stop: () => void;
  currentTime: number;
  duration: number;
  sampleRate: number;
  isActive: boolean;
  isReady: boolean;
  error: string | null;
}

export interface SamplerProps {
  output: ModStreamRef;
  /** Gate/trigger input - rising edge triggers playback */
  gate?: ModStreamRef;
  /** Pitch CV input - modulates playback rate in semitones */
  pitchCv?: ModStreamRef;
  label?: string;
  enabled?: boolean;
  // Controlled props
  src?: string;
  onSrcChange?: (src: string) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
  gain?: number;
  onGainChange?: (gain: number) => void;
  /** Playback mode: 'one-shot' plays once, 'gate' plays while gate is high, 'loop' loops while gate is high */
  playbackMode?: PlaybackMode;
  onPlaybackModeChange?: (mode: PlaybackMode) => void;
  /** Start time in seconds for sample region */
  startTime?: number;
  onStartTimeChange?: (time: number) => void;
  /** End time in seconds for sample region (0 = end of file) */
  endTime?: number;
  onEndTimeChange?: (time: number) => void;
  /** Base pitch offset in octaves */
  pitch?: number;
  onPitchChange?: (pitch: number) => void;
  // Event callbacks
  onPlayingChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: string | null) => void;
  onEnd?: () => void;
  // Render props
  children?: (props: SamplerRenderProps) => ReactNode;
}

export const Sampler = React.forwardRef<SamplerHandle, SamplerProps>(({
  output,
  gate: gateInput,
  pitchCv,
  label = 'sampler',
  enabled = true,
  src: controlledSrc,
  onSrcChange,
  fileName: controlledFileName,
  onFileNameChange,
  gain: controlledGain,
  onGainChange,
  playbackMode: controlledPlaybackMode,
  onPlaybackModeChange,
  startTime: controlledStartTime,
  onStartTimeChange,
  endTime: controlledEndTime,
  onEndTimeChange,
  pitch: controlledPitch,
  onPitchChange,
  onPlayingChange,
  onTimeUpdate,
  onError,
  onEnd,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [src, setSrc] = useControlledState(controlledSrc, '', onSrcChange);
  const [fileName, setFileName] = useControlledState(controlledFileName, '', onFileNameChange);
  const [gain, setGain] = useControlledState(controlledGain, 1.0, onGainChange);
  const [playbackMode, setPlaybackMode] = useControlledState<PlaybackMode>(
    controlledPlaybackMode,
    'one-shot',
    onPlaybackModeChange
  );
  const [startTime, setStartTime] = useControlledState(controlledStartTime, 0, onStartTimeChange);
  const [endTime, setEndTime] = useControlledState(controlledEndTime, 0, onEndTimeChange);
  const [pitch, setPitch] = useControlledState(controlledPitch, 0.0, onPitchChange);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isWorkletReady, setIsWorkletReady] = useState(false);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const pitchCvNodeRef = useRef<AudioWorkletNode | null>(null);
  const gateNodeRef = useRef<AudioWorkletNode | null>(null);
  const pitchCvValueRef = useRef(0);
  const gateStateRef = useRef(false);
  const pitchRef = useRef(pitch);
  const playbackModeRef = useRef<PlaybackMode>(playbackMode);
  const startTimeRef = useRef(startTime);
  const endTimeRef = useRef(endTime);
  const pendingAutoplayRef = useRef(false);
  const unlockListenerRef = useRef<(() => void) | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const playRetryRef = useRef<number | null>(null);

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const FADE_IN_TIME = 0.001;
  const FADE_OUT_TIME = 0.045;

  const fadeGainTo = (target: number, fadeTime: number) => {
    if (!audioContext || !gainNodeRef.current) return;
    const now = audioContext.currentTime;
    const param = gainNodeRef.current.gain;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.setTargetAtTime(target, now, Math.max(0.001, fadeTime / 3));
  };

  const fadeIn = () => {
    if (!audioContext || !gainNodeRef.current) return;
    const now = audioContext.currentTime;
    const param = gainNodeRef.current.gain;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.setTargetAtTime(gain, now, Math.max(0.001, FADE_IN_TIME / 3));
  };

  const stopWithFade = (resetToStart: boolean) => {
    if (!audioElementRef.current) return;
    if (!audioContext || !gainNodeRef.current) {
      audioElementRef.current.pause();
      if (resetToStart) seekToStart();
      return;
    }
    if (stopTimeoutRef.current !== null) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    fadeGainTo(0, FADE_OUT_TIME);
    stopTimeoutRef.current = window.setTimeout(() => {
      if (!audioElementRef.current) return;
      audioElementRef.current.pause();
      if (resetToStart) seekToStart();
      if (gainNodeRef.current && audioContext) {
        const now = audioContext.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(now);
        gainNodeRef.current.gain.setValueAtTime(gain, now);
      }
      stopTimeoutRef.current = null;
    }, FADE_OUT_TIME * 1000);
  };

  const ensureUserGesturePlayback = () => {
    if (unlockListenerRef.current) return;
    const onUnlock = async () => {
      unlockListenerRef.current = null;
      window.removeEventListener('pointerdown', onUnlock);
      window.removeEventListener('keydown', onUnlock);
      if (!pendingAutoplayRef.current) return;
      pendingAutoplayRef.current = false;
      if (!audioContext) return;
      try {
        await audioContext.resume();
      } catch {
        return;
      }
      const mode = playbackModeRef.current;
      if ((mode === 'gate' || mode === 'loop') && !gateStateRef.current) return;
      triggerPlayback();
    };
    unlockListenerRef.current = onUnlock;
    window.addEventListener('pointerdown', onUnlock);
    window.addEventListener('keydown', onUnlock);
  };

  const handleAutoplayBlocked = () => {
    pendingAutoplayRef.current = true;
    setError(null);
    ensureUserGesturePlayback();
  };

  const isAutoplayError = (err: unknown) => {
    if (pendingAutoplayRef.current) return true;
    if (audioContext && audioContext.state !== 'running') return true;
    if ((err as Error)?.name === 'NotAllowedError') return true;
    const message = typeof (err as Error)?.message === 'string' ? (err as Error).message.toLowerCase() : '';
    return message.includes('user interaction') || message.includes('gesture') || message.includes('notallowed');
  };

  const isAbortPlayError = (err: unknown) => (err as Error)?.name === 'AbortError';

  const getEffectiveStart = () => {
    if (!duration) return 0;
    return clamp(startTimeRef.current, 0, duration);
  };

  const getEffectiveEnd = () => {
    if (!duration) return 0;
    const end = endTimeRef.current > 0 ? endTimeRef.current : duration;
    return clamp(end, 0, duration);
  };

  const updatePlaybackRate = () => {
    if (!audioElementRef.current) return;
    const cvValue = Number.isFinite(pitchCvValueRef.current) ? pitchCvValueRef.current : 0;
    const semitones = clamp(cvValue, -24, 24);
    const baseOctaves = Number.isFinite(pitchRef.current) ? pitchRef.current : 0;
    const targetRate = Math.pow(2, baseOctaves + semitones / 12);
    const rate = clamp(targetRate, 0.25, 4);
    const element = audioElementRef.current;
    try {
      element.playbackRate = rate;
      element.defaultPlaybackRate = rate;
    } catch (err) {
      const errorName = (err as Error | null)?.name;
      if (errorName !== 'NotSupportedError') {
        throw err;
      }
    }
    if ('preservesPitch' in element) {
      element.preservesPitch = false;
    }
    if ('mozPreservesPitch' in element) {
      (element as unknown as { mozPreservesPitch: boolean }).mozPreservesPitch = false;
    }
    if ('webkitPreservesPitch' in element) {
      (element as unknown as { webkitPreservesPitch: boolean }).webkitPreservesPitch = false;
    }
  };

  const seekToStart = () => {
    if (!audioElementRef.current) return;
    audioElementRef.current.currentTime = getEffectiveStart();
  };

  const stopAtStart = () => {
    if (!audioElementRef.current) return;
    stopWithFade(true);
  };

  const triggerPlayback = async () => {
    if (!audioElementRef.current || !enabled) return;
    if (stopTimeoutRef.current !== null) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (audioContext && audioContext.state !== 'running') {
      handleAutoplayBlocked();
      return;
    }
    seekToStart();
    await play();
  };

  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  useEffect(() => {
    pitchRef.current = pitch;
    updatePlaybackRate();
  }, [pitch]);

  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    endTimeRef.current = endTime;
  }, [endTime]);

  // Create output gain once (stable connection for Monitor)
  useEffect(() => {
    if (!audioContext) return;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    // Set output ref with stable gain node
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

  // Handle source changes separately
  useEffect(() => {
    if (!audioContext || !src || !gainNodeRef.current) return;

    let audioElement: HTMLAudioElement | null = null;
    let sourceNode: MediaElementAudioSourceNode | null = null;
    const currentSrc = src;

    const setupAudio = async () => {
      try {
        // Clean up previous source if it exists
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch {
            // Already disconnected
          }
          sourceNodeRef.current = null;
        }

        // Stop and clean up previous audio element
        if (audioElementRef.current) {
          const oldElement = audioElementRef.current;
          oldElement.pause();
          if (typeof oldElement.removeAttribute === 'function') {
            oldElement.removeAttribute('src');
          } else {
            oldElement.src = '';
          }
          oldElement.load();
          audioElementRef.current = null;
        }

        // Reset state when loading new audio
        setIsReady(false);
        setIsPlaying(false);
        setError(null);
        setCurrentTime(0);
        setDuration(0);

        // Create fresh audio element
        audioElement = new Audio();
        if ('preservesPitch' in audioElement) {
          audioElement.preservesPitch = false;
        }
        if ('mozPreservesPitch' in audioElement) {
          (audioElement as unknown as { mozPreservesPitch: boolean }).mozPreservesPitch = false;
        }
        if ('webkitPreservesPitch' in audioElement) {
          (audioElement as unknown as { webkitPreservesPitch: boolean }).webkitPreservesPitch = false;
        }
        audioElement.loop = false;
        if (!src.startsWith('blob:') && !src.startsWith('data:')) {
          audioElement.crossOrigin = 'anonymous';
        }
        audioElement.preload = 'auto';
        audioElement.src = src;
        audioElementRef.current = audioElement;
        updatePlaybackRate();

        // Create source from audio element
        sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNodeRef.current = sourceNode;

        // Connect source to existing stable gain node
        sourceNode.connect(gainNodeRef.current!);

        // Set up event listeners
        audioElement.addEventListener('loadedmetadata', () => {
          setDuration(audioElement!.duration);
        });

        audioElement.addEventListener('canplaythrough', () => {
          setIsReady(true);
        });

        audioElement.addEventListener('timeupdate', () => {
          const current = audioElement!.currentTime;
          const regionStart = getEffectiveStart();
          const regionEnd = getEffectiveEnd();
          if (regionEnd > 0 && current >= regionEnd) {
            if (playbackModeRef.current === 'loop') {
              audioElement!.currentTime = regionStart;
              if (!audioElement!.paused) {
                audioElement!.play().catch((err) => {
                  if (isAutoplayError(err)) {
                    handleAutoplayBlocked();
                    return;
                  }
                  if (isAbortPlayError(err)) {
                    return;
                  }
                  setError('Playback failed. User interaction may be required.');
                });
              }
            } else {
              audioElement!.pause();
              audioElement!.currentTime = regionStart;
              setIsPlaying(false);
              onEnd?.();
            }
          } else if (current < regionStart) {
            audioElement!.currentTime = regionStart;
          }
          setCurrentTime(audioElement!.currentTime);
        });

        audioElement.addEventListener('play', () => setIsPlaying(true));
        audioElement.addEventListener('pause', () => setIsPlaying(false));
        audioElement.addEventListener('ended', () => {
          setIsPlaying(false);
          onEnd?.();
        });

        audioElement.addEventListener('error', () => {
          setError('Failed to load audio file');
          setIsReady(false);
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio');
        setIsReady(false);
      }
    };

    setupAudio();

    return () => {
      if (audioElement) {
        audioElement.pause();
        if (typeof audioElement.removeAttribute === 'function') {
          audioElement.removeAttribute('src');
        } else {
          audioElement.src = '';
        }
        audioElement.load();
      }
      if (sourceNode) {
        sourceNode.disconnect();
      }
      if (blobUrlRef.current === currentSrc && currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
        blobUrlRef.current = null;
      }
    };
  }, [audioContext, src]);

  // Update gain when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Clamp playback position to region when start/end changes
  useEffect(() => {
    if (!audioElementRef.current || !duration) return;
    const start = getEffectiveStart();
    const end = getEffectiveEnd();
    if (end > 0 && end < start) return;
    if (audioElementRef.current.currentTime < start || (end > 0 && audioElementRef.current.currentTime > end)) {
      audioElementRef.current.currentTime = start;
    }
  }, [startTime, endTime, duration]);

  // Load file from File object
  const loadFile = (file: File) => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        setFileName(file.name);
        setSrc(result);
      }
    };
    reader.onerror = () => {
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      setFileName(file.name);
      setSrc(url);
    };
    reader.readAsDataURL(file);
  };

  // Cleanup any pending unlock listeners
  useEffect(() => {
    return () => {
      if (unlockListenerRef.current) {
        window.removeEventListener('pointerdown', unlockListenerRef.current);
        window.removeEventListener('keydown', unlockListenerRef.current);
        unlockListenerRef.current = null;
      }
    };
  }, []);

  // Tighter loop watcher for short regions
  useEffect(() => {
    if (!isPlaying || playbackModeRef.current !== 'loop') return;
    const interval = setInterval(() => {
      const element = audioElementRef.current;
      if (!element) return;
      const regionStart = getEffectiveStart();
      const regionEnd = getEffectiveEnd();
      if (regionEnd > 0 && element.currentTime >= regionEnd) {
        element.currentTime = regionStart;
        if (!element.paused) {
          element.play().catch((err) => {
            if (isAutoplayError(err)) {
              handleAutoplayBlocked();
              return;
            }
            if (isAbortPlayError(err)) {
              return;
            }
            setError('Playback failed. User interaction may be required.');
          });
        }
      }
    }, 10);
    return () => clearInterval(interval);
  }, [isPlaying, playbackMode, startTime, endTime, duration]);

  // Set up CV/gate worklets
  useEffect(() => {
    if (!audioContext) return;
    let cancelled = false;

    loadSamplerWorklets(audioContext).then(() => {
      if (cancelled) return;

      if (!gateNodeRef.current) {
        const gateNode = new AudioWorkletNode(audioContext, 'sampler-gate-detector', {
          numberOfInputs: 1,
          numberOfOutputs: 0,
          channelCount: 1,
        });
        gateNode.port.onmessage = (event) => {
          if (!enabled) return;
          const mode = playbackModeRef.current;
          if (event.data?.type === 'gate-on') {
            gateStateRef.current = true;
            if (mode === 'gate' || mode === 'loop' || mode === 'one-shot') {
              triggerPlayback();
            }
          }
          if (event.data?.type === 'gate-off') {
            gateStateRef.current = false;
            if (mode === 'gate' || mode === 'loop') {
              stopAtStart();
            }
          }
        };
        gateNodeRef.current = gateNode;
      }

      if (!pitchCvNodeRef.current) {
        const pitchNode = new AudioWorkletNode(audioContext, 'sampler-cv-follower', {
          numberOfInputs: 1,
          numberOfOutputs: 0,
          channelCount: 1,
        });
        pitchNode.port.onmessage = (event) => {
          if (event.data?.type !== 'cv') return;
          pitchCvValueRef.current = event.data.value;
          updatePlaybackRate();
        };
        pitchCvNodeRef.current = pitchNode;
      }
      setIsWorkletReady(true);
    }).catch((err) => {
      if (cancelled) return;
      console.error('Failed to load Sampler worklets', err);
    });

    return () => {
      cancelled = true;
      if (gateNodeRef.current) {
        if (gateNodeRef.current.port) {
          gateNodeRef.current.port.onmessage = null;
        }
        try { gateNodeRef.current.disconnect(); } catch { /* ignore */ }
        gateNodeRef.current = null;
      }
      if (pitchCvNodeRef.current) {
        if (pitchCvNodeRef.current.port) {
          pitchCvNodeRef.current.port.onmessage = null;
        }
        try { pitchCvNodeRef.current.disconnect(); } catch { /* ignore */ }
        pitchCvNodeRef.current = null;
      }
      setIsWorkletReady(false);
    };
  }, [audioContext]);

  const gateKey = gateInput?.current?.audioNode ? String(gateInput.current.audioNode) : 'null';
  useEffect(() => {
    if (!gateInput?.current || !gateNodeRef.current || !isWorkletReady) return;
    const inGain = gateInput.current.gain;
    const listener = gateNodeRef.current;
    inGain.connect(listener);
    return () => {
      try { inGain.disconnect(listener); } catch { /* ignore */ }
    };
  }, [gateKey, isWorkletReady]);

  const pitchCvKey = pitchCv?.current?.audioNode ? String(pitchCv.current.audioNode) : 'null';
  useEffect(() => {
    if (!pitchCv?.current || !pitchCvNodeRef.current || !isWorkletReady) return;
    const inGain = pitchCv.current.gain;
    const listener = pitchCvNodeRef.current;
    inGain.connect(listener);
    return () => {
      try { inGain.disconnect(listener); } catch { /* ignore */ }
      pitchCvValueRef.current = 0;
      updatePlaybackRate();
    };
  }, [pitchCvKey, isWorkletReady]);

  // Playback controls
  const play = async () => {
    if (audioElementRef.current && audioContext) {
      if (stopTimeoutRef.current !== null) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      fadeIn();
      if (audioContext.state !== 'running') {
        try {
          await audioContext.resume();
        } catch {
          handleAutoplayBlocked();
          return;
        }
      }
      const isRunning = audioContext.state === 'running';
      if (!isRunning) {
        handleAutoplayBlocked();
        return;
      }
      if (audioElementRef.current.currentTime < getEffectiveStart()) {
        seekToStart();
      }
      audioElementRef.current.play().catch((err) => {
        if (isAutoplayError(err)) {
          handleAutoplayBlocked();
          return;
        }
        if (isAbortPlayError(err)) {
          if (playRetryRef.current !== null) {
            return;
          }
          playRetryRef.current = window.setTimeout(() => {
            playRetryRef.current = null;
            audioElementRef.current?.play().catch((retryErr) => {
              if (isAutoplayError(retryErr)) {
                handleAutoplayBlocked();
                return;
              }
              if (isAbortPlayError(retryErr)) {
                return;
              }
              setError('Playback failed. User interaction may be required.');
            });
          }, 0);
          return;
        }
        setError('Playback failed. User interaction may be required.');
      });
    }
  };

  const stop = () => {
    stopWithFade(true);
  };

  const triggerCommand = async () => {
    if (playbackMode === 'gate') {
      gateStateRef.current = true;
    }
    await triggerPlayback();
  };

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    trigger: triggerCommand,
    stop,
    loadFile,
    getState: () => ({
      src,
      fileName,
      gain,
      playbackMode,
      startTime,
      endTime,
      pitch,
      isPlaying,
      isReady,
      currentTime,
      duration,
      error
    }),
  }), [src, fileName, gain, playbackMode, startTime, endTime, pitch, isPlaying, isReady, currentTime, duration, error]);

  // Event callback effects
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    onTimeUpdate?.(currentTime, duration);
  }, [currentTime, duration, onTimeUpdate]);

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  if (error) {
    console.warn(`Sampler error: ${error}`);
  }

  // Render children with state
  if (children) {
    return <>{children({
      src,
      setSrc,
      fileName,
      setFileName,
      loadFile,
      gain,
      setGain,
      playbackMode,
      setPlaybackMode,
      startTime,
      setStartTime,
      endTime,
      setEndTime,
      pitch,
      setPitch,
      isPlaying,
      trigger: triggerCommand,
      stop,
      currentTime,
      duration,
      sampleRate: audioContext?.sampleRate ?? 44100,
      isActive: !!output.current,
      isReady,
      error,
    })}</>;
  }

  return null;
});

Sampler.displayName = 'Sampler';
