import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface LevelMeterRenderProps {
  level: number; // Current RMS level (0-1)
  peak: number; // Peak level (0-1)
  isClipping: boolean; // True if peak >= 1.0
  isActive: boolean;
}

export interface LevelMeterProps {
  input: ModStreamRef;
  fftSize?: number; // Must be power of 2 between 32 and 32768
  peakHoldTime?: number; // Time in ms to hold peak value
  clipThreshold?: number; // Threshold for clipping indicator (0-1)
  children: (props: LevelMeterRenderProps) => ReactNode;
}

export const LevelMeter: React.FC<LevelMeterProps> = ({
  input,
  fftSize = 2048,
  peakHoldTime = 1000,
  clipThreshold = 0.95,
  children,
}) => {
  const audioContext = useAudioContext();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const peakTimeoutRef = useRef<number | null>(null);
  const currentInputNodeRef = useRef<AudioNode | null>(null);
  const peakValueRef = useRef(0); // Track peak without causing re-renders

  // Setup analyser and connection
  useEffect(() => {
    if (!audioContext) {
      return;
    }

    let dataArray: Uint8Array | null = null;

    // Animation loop to calculate levels and check for input changes
    const updateLevels = () => {
      const inputNode = input.current?.audioNode;

      // Check if input node has changed
      if (inputNode !== currentInputNodeRef.current) {
        // Disconnect old analyser if exists
        if (analyserRef.current) {
          try {
            analyserRef.current.disconnect();
          } catch (e) {
            // Already disconnected
          }
          analyserRef.current = null;
        }

        // Clear peak timeout
        if (peakTimeoutRef.current) {
          window.clearTimeout(peakTimeoutRef.current);
          peakTimeoutRef.current = null;
        }

        // If we have a new input node, create new analyser
        if (inputNode) {
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = fftSize;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;

          // Setup data array
          dataArray = new Uint8Array(analyser.frequencyBinCount);

          // Connect input to analyser
          inputNode.connect(analyser);

          // Reset levels
          setLevel(0);
          setPeak(0);
          setIsClipping(false);
          peakValueRef.current = 0;
        } else {
          // No input, clear data
          setLevel(0);
          setPeak(0);
          setIsClipping(false);
          peakValueRef.current = 0;
          dataArray = null;
        }

        currentInputNodeRef.current = inputNode || null;
      }

      // Update levels if we have an analyser
      if (analyserRef.current && dataArray) {
        analyserRef.current.getByteTimeDomainData(dataArray as any);

        // Calculate RMS (root mean square) level
        let sum = 0;
        let maxVal = 0;
        for (let i = 0; i < dataArray.length; i++) {
          // Convert from 0-255 to -1 to 1
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
          maxVal = Math.max(maxVal, Math.abs(normalized));
        }
        const rms = Math.sqrt(sum / dataArray.length);

        setLevel(rms);

        // Update peak if current level is higher
        if (maxVal > peakValueRef.current) {
          peakValueRef.current = maxVal;
          setPeak(maxVal);
          setIsClipping(maxVal >= clipThreshold);

          // Reset peak after hold time
          if (peakTimeoutRef.current) {
            window.clearTimeout(peakTimeoutRef.current);
          }
          peakTimeoutRef.current = window.setTimeout(() => {
            setPeak(0);
            setIsClipping(false);
            peakValueRef.current = 0;
          }, peakHoldTime);
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (peakTimeoutRef.current) {
        window.clearTimeout(peakTimeoutRef.current);
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      analyserRef.current = null;
      currentInputNodeRef.current = null;
    };
  }, [audioContext, input, fftSize, peakHoldTime, clipThreshold]);

  return <>{children({
    level,
    peak,
    isClipping,
    isActive: !!analyserRef.current,
  })}</>;
};

LevelMeter.displayName = 'LevelMeter';
