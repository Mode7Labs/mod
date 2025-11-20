import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface OscilloscopeRenderProps {
  dataArray: Uint8Array;
  bufferLength: number;
  isActive: boolean;
}

export interface OscilloscopeProps {
  input: ModStreamRef;
  fftSize?: number; // Must be power of 2 between 32 and 32768
  children: (props: OscilloscopeRenderProps) => ReactNode;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  input,
  fftSize = 2048,
  children,
}) => {
  const audioContext = useAudioContext();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array>(new Uint8Array(0));
  const [bufferLength, setBufferLength] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const currentInputNodeRef = useRef<AudioNode | null>(null);

  // Setup analyser and connection
  useEffect(() => {
    if (!audioContext) {
      return;
    }

    let dataArr: Uint8Array | null = null;

    // Animation loop to update data and check for input changes
    const updateData = () => {
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

        // If we have a new input node, create new analyser
        if (inputNode) {
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = fftSize;
          analyser.smoothingTimeConstant = 0.8;
          analyserRef.current = analyser;

          // Setup data array
          const bufLen = analyser.frequencyBinCount;
          dataArr = new Uint8Array(bufLen);

          // Connect input to analyser
          inputNode.connect(analyser);

          // Set initial data state
          setBufferLength(bufLen);
          setDataArray(dataArr);
        } else {
          // No input, clear data
          setBufferLength(0);
          setDataArray(new Uint8Array(0));
          dataArr = null;
        }

        currentInputNodeRef.current = inputNode || null;
      }

      // Update visualization data if we have an analyser
      if (analyserRef.current && dataArr) {
        analyserRef.current.getByteTimeDomainData(dataArr as any);
        // Create new array to trigger re-render
        const newArray = new Uint8Array(dataArr.length);
        newArray.set(dataArr as any);
        setDataArray(newArray);
      }

      animationFrameRef.current = requestAnimationFrame(updateData);
    };

    updateData();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      analyserRef.current = null;
      currentInputNodeRef.current = null;
    };
  }, [audioContext, input, fftSize]);

  return <>{children({
    dataArray,
    bufferLength,
    isActive: !!analyserRef.current,
  })}</>;
};

Oscilloscope.displayName = 'Oscilloscope';
