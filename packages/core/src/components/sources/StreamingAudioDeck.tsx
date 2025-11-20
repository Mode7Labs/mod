import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface StreamingAudioDeckHandle {
  play: () => void;
  pause: () => void;
  getState: () => {
    url: string;
    gain: number;
    isPlaying: boolean;
    error: string | null;
  };
}

export interface StreamingAudioDeckRenderProps {
  url: string;
  setUrl: (url: string) => void;
  gain: number;
  setGain: (value: number) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  isActive: boolean;
  error: string | null;
}

export interface StreamingAudioDeckProps {
  output: ModStreamRef;
  label?: string;
  // Controlled props
  url?: string;
  onUrlChange?: (url: string) => void;
  gain?: number;
  onGainChange?: (gain: number) => void;
  // Event callbacks
  onPlayingChange?: (isPlaying: boolean) => void;
  onError?: (error: string | null) => void;
  // Render props
  children?: (props: StreamingAudioDeckRenderProps) => ReactNode;
}

export const StreamingAudioDeck = React.forwardRef<StreamingAudioDeckHandle, StreamingAudioDeckProps>(({
  output,
  label = 'streaming-audio-deck',
  url: controlledUrl,
  onUrlChange,
  gain: controlledGain,
  onGainChange,
  onPlayingChange,
  onError,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [url, setUrl] = useControlledState(controlledUrl, '', onUrlChange);
  const [gain, setGain] = useControlledState(controlledGain, 1.0, onGainChange);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Create output gain once
  useEffect(() => {
    if (!audioContext) return;

    // Create gain node (only once)
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    // Set output ref with stable gain node
    output.current = {
      audioNode: gainNode, // Use gain as the audio node initially
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'stream',
      },
    };

    // Cleanup
    return () => {
      gainNode.disconnect();
      output.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  // Handle URL changes separately
  useEffect(() => {
    if (!audioContext || !url || !gainNodeRef.current) return;

    // Capture whether we should auto-play the new URL
    const shouldAutoPlay = audioElementRef.current?.paused === false;

    // Store references for cleanup
    let audioElement: HTMLAudioElement | null = null;
    let sourceNode: MediaElementAudioSourceNode | null = null;

    const setupStreaming = async () => {
      try {
        // Clean up previous source completely
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch (e) {
            // Already disconnected
          }
          sourceNodeRef.current = null;
        }

        // Stop and remove previous audio element completely
        if (audioElementRef.current) {
          // Remove event listeners to prevent state updates during cleanup
          const oldElement = audioElementRef.current;
          oldElement.pause();
          oldElement.removeAttribute('src');
          oldElement.load(); // Important: release resources
          audioElementRef.current = null;
        }

        // Reset error state when loading new URL
        setError(null);

        // Create a fresh audio element for streaming
        audioElement = new Audio();
        audioElement.crossOrigin = 'anonymous';
        audioElement.src = url;
        audioElementRef.current = audioElement;

        // Create source from the new audio element
        sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNodeRef.current = sourceNode;

        // Connect source to existing gain
        sourceNode.connect(gainNodeRef.current!);

        // Update output ref's audioNode to new source
        if (output.current) {
          output.current.audioNode = sourceNode;
        }

        // Set up event listeners
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);
        const handleError = (e: Event) => {
          setError('Failed to load stream');
          console.error('Stream error:', e);
        };

        audioElement.addEventListener('play', handlePlay);
        audioElement.addEventListener('pause', handlePause);
        audioElement.addEventListener('ended', handleEnded);
        audioElement.addEventListener('error', handleError);

        // If we were playing before, start playing the new URL
        if (shouldAutoPlay) {
          // Resume audio context if suspended
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          try {
            await audioElement.play();
            setIsPlaying(true);
          } catch (err) {
            console.warn('Auto-play failed for new URL:', err);
            setIsPlaying(false);
          }
        } else {
          setIsPlaying(false);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to setup stream');
        console.error('StreamingAudioDeck error:', err);
        setIsPlaying(false);
      }
    };

    setupStreaming();

    // Cleanup when URL changes
    return () => {
      if (sourceNode) {
        try {
          sourceNode.disconnect();
        } catch (e) {
          // Already disconnected
        }
      }
      if (audioElement) {
        audioElement.pause();
        audioElement.removeAttribute('src');
        audioElement.load();
      }
      sourceNodeRef.current = null;
      audioElementRef.current = null;
    };
  }, [audioContext, url]);

  // Update gain when it changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  // Playback controls
  const play = async () => {
    if (audioElementRef.current && audioContext) {
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioElementRef.current.play().catch(err => {
        setError('Failed to start stream. User interaction may be required.');
        console.warn('Stream playback blocked:', err);
      });
    }
  };

  const pause = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    play,
    pause,
    getState: () => ({ url, gain, isPlaying, error }),
  }), [url, gain, isPlaying, error]);

  // Event callback effects
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  if (error) {
    console.warn(`StreamingAudioDeck error: ${error}`);
  }

  // Render children with state
  if (children) {
    return <>{children({
      url,
      setUrl,
      gain,
      setGain,
      isPlaying,
      play,
      pause,
      isActive: !!output.current,
      error,
    })}</>;
  }

  return null;
});

StreamingAudioDeck.displayName = 'StreamingAudioDeck';
