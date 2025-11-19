import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

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
  children?: (props: StreamingAudioDeckRenderProps) => ReactNode;
}

export const StreamingAudioDeck: React.FC<StreamingAudioDeckProps> = ({
  output,
  label = 'streaming-audio-deck',
  children,
}) => {
  const audioContext = useAudioContext();
  const [url, setUrl] = useState('');
  const [gain, setGain] = useState(1.0);
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

    let audioElement: HTMLAudioElement | null = null;
    let sourceNode: MediaElementAudioSourceNode | null = null;

    const setupStreaming = () => {
      try {
        // Disconnect previous source if exists
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.disconnect();
          } catch (e) {
            // Already disconnected
          }
        }

        // Stop previous audio element
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.src = '';
        }

        // Create audio element for streaming
        audioElement = new Audio(url);
        audioElement.crossOrigin = 'anonymous';
        audioElementRef.current = audioElement;

        // Create source from audio element
        sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNodeRef.current = sourceNode;

        // Connect source to existing gain
        sourceNode.connect(gainNodeRef.current!);

        // Update output ref's audioNode to new source
        if (output.current) {
          output.current.audioNode = sourceNode;
        }

        // Set up event listeners
        audioElement.addEventListener('play', () => setIsPlaying(true));
        audioElement.addEventListener('pause', () => setIsPlaying(false));
        audioElement.addEventListener('ended', () => setIsPlaying(false));

        audioElement.addEventListener('error', (e) => {
          setError('Failed to load stream');
          console.error('Stream error:', e);
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to setup stream');
        console.error('StreamingAudioDeck error:', err);
      }
    };

    setupStreaming();

    // Cleanup when URL changes
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      if (sourceNode) {
        sourceNode.disconnect();
      }
      audioElementRef.current = null;
      sourceNodeRef.current = null;
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
};
