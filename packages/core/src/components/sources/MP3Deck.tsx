import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

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
  children?: (props: MP3DeckRenderProps) => ReactNode;
}

export const MP3Deck: React.FC<MP3DeckProps> = ({
  output,
  label = 'mp3-deck',
  children,
}) => {
  const audioContext = useAudioContext();
  const [src, setSrc] = useState('');
  const [gain, setGain] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

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
    const url = URL.createObjectURL(file);
    setSrc(url);
  };

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
};
