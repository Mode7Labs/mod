import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface MP3DeckHandle {
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  loadFile: (file: File) => void;
  getState: () => {
    src: string;
    gain: number;
    loop: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    error: string | null;
  };
}

export interface MP3DeckRenderProps {
  src: string;
  setSrc: (src: string) => void;
  loadFile: (file: File) => void;
  gain: number;
  setGain: (value: number) => void;
  loop: boolean;
  setLoop: (value: boolean) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
  isActive: boolean;
  error: string | null;
}

export interface MP3DeckProps {
  output: ModStreamRef;
  label?: string;
  // Controlled props
  src?: string;
  onSrcChange?: (src: string) => void;
  gain?: number;
  onGainChange?: (gain: number) => void;
  loop?: boolean;
  onLoopChange?: (loop: boolean) => void;
  // Event callbacks
  onPlayingChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: string | null) => void;
  // Render props
  children?: (props: MP3DeckRenderProps) => ReactNode;
}

export const MP3Deck = React.forwardRef<MP3DeckHandle, MP3DeckProps>(({
  output,
  label = 'mp3-deck',
  src: controlledSrc,
  onSrcChange,
  gain: controlledGain,
  onGainChange,
  loop: controlledLoop,
  onLoopChange,
  onPlayingChange,
  onTimeUpdate,
  onError,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [src, setSrc] = useControlledState(controlledSrc, '', onSrcChange);
  const [gain, setGain] = useControlledState(controlledGain, 1.0, onGainChange);
  const [loop, setLoop] = useControlledState(controlledLoop, false, onLoopChange);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Create audio nodes once
  useEffect(() => {
    if (!audioContext || !src) return;

    let audioElement: HTMLAudioElement | null = null;
    let sourceNode: MediaElementAudioSourceNode | null = null;

    const setupAudio = async () => {
      try {
        // Create audio element
        audioElement = new Audio(src);
        audioElement.loop = loop;
        audioElement.crossOrigin = 'anonymous';
        audioElementRef.current = audioElement;

        // Create source from audio element
        sourceNode = audioContext.createMediaElementSource(audioElement);

        // Create gain node
        const gainNode = audioContext.createGain();
        gainNode.gain.value = gain;
        gainNodeRef.current = gainNode;

        // Connect source to gain
        sourceNode.connect(gainNode);

        // Set output ref
        output.current = {
          audioNode: sourceNode,
          gain: gainNode,
          context: audioContext,
          metadata: {
            label,
            sourceType: 'mp3',
          },
        };

        // Set up event listeners
        audioElement.addEventListener('loadedmetadata', () => {
          setDuration(audioElement!.duration);
        });

        audioElement.addEventListener('timeupdate', () => {
          setCurrentTime(audioElement!.currentTime);
        });

        audioElement.addEventListener('play', () => setIsPlaying(true));
        audioElement.addEventListener('pause', () => setIsPlaying(false));
        audioElement.addEventListener('ended', () => setIsPlaying(false));

        audioElement.addEventListener('error', (e) => {
          setError('Failed to load audio file');
          console.error('Audio error:', e);
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audio');
        console.error('MP3Deck error:', err);
      }
    };

    setupAudio();

    // Cleanup
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      if (sourceNode) {
        sourceNode.disconnect();
      }
      if (output.current?.gain) {
        output.current.gain.disconnect();
      }
      // Revoke blob URL on unmount
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      output.current = null;
      audioElementRef.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, src, label, output]);

  // Update loop when it changes
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.loop = loop;
    }
  }, [loop]);

  // Update gain when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Load file from File object
  const loadFile = (file: File) => {
    // Revoke previous blob URL to prevent memory leak
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setSrc(url);
  };

  // Auto-pause when output becomes disconnected
  useEffect(() => {
    // Check if output is connected by seeing if gain node has any connections
    const checkConnection = () => {
      if (!output.current && isPlaying) {
        // Output was disconnected while playing - pause
        pause();
      }
    };

    // Check periodically (this is a fallback, ideally parent would handle this)
    const interval = setInterval(checkConnection, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Playback controls
  const play = async () => {
    if (audioElementRef.current && audioContext) {
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioElementRef.current.play().catch(err => {
        setError('Playback failed. User interaction may be required.');
        console.warn('Play failed:', err);
      });
    }
  };

  const pause = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  const stop = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
  };

  const seek = (time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
  };

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    play,
    pause,
    stop,
    seek,
    loadFile,
    getState: () => ({ src, gain, loop, isPlaying, currentTime, duration, error }),
  }), [src, gain, loop, isPlaying, currentTime, duration, error]);

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
    console.warn(`MP3Deck error: ${error}`);
  }

  // Render children with state
  if (children) {
    return <>{children({
      src,
      setSrc,
      loadFile,
      gain,
      setGain,
      loop,
      setLoop,
      isPlaying,
      play,
      pause,
      stop,
      currentTime,
      duration,
      seek,
      isActive: !!output.current,
      error,
    })}</>;
  }

  return null;
});

MP3Deck.displayName = 'MP3Deck';
