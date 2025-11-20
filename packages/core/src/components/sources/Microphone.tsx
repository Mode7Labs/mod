import React, { useEffect, useState, useRef, ReactNode, useImperativeHandle } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { useControlledState } from '../../hooks/useControlledState';

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export interface MicrophoneHandle {
  selectDevice: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
  getState: () => {
    gain: number;
    isMuted: boolean;
    devices: AudioDevice[];
    selectedDeviceId: string | null;
    error: string | null;
  };
}

export interface MicrophoneRenderProps {
  gain: number;
  setGain: (value: number) => void;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  devices: AudioDevice[];
  selectedDeviceId: string | null;
  selectDevice: (deviceId: string) => void;
  refreshDevices: () => Promise<void>;
  isActive: boolean;
  error: string | null;
}

export interface MicrophoneProps {
  output: ModStreamRef;
  label?: string;
  deviceId?: string; // Optional: pre-select a device
  // Controlled props
  gain?: number;
  onGainChange?: (gain: number) => void;
  isMuted?: boolean;
  onMutedChange?: (isMuted: boolean) => void;
  selectedDeviceId?: string;
  onSelectedDeviceIdChange?: (deviceId: string | null) => void;
  // Event callbacks
  onDevicesChange?: (devices: AudioDevice[]) => void;
  onError?: (error: string | null) => void;
  // Render props
  children?: (props: MicrophoneRenderProps) => ReactNode;
}

export const Microphone = React.forwardRef<MicrophoneHandle, MicrophoneProps>(({
  output,
  label = 'microphone',
  deviceId: initialDeviceId,
  gain: controlledGain,
  onGainChange,
  isMuted: controlledMuted,
  onMutedChange,
  selectedDeviceId: controlledDeviceId,
  onSelectedDeviceIdChange,
  onDevicesChange,
  onError,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [gain, setGain] = useControlledState(controlledGain, 1.0, onGainChange);
  const [isMuted, setMuted] = useControlledState(controlledMuted, false, onMutedChange);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useControlledState(
    controlledDeviceId,
    initialDeviceId || null,
    onSelectedDeviceIdChange
  );

  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Get available audio devices
  const refreshDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
        }));
      setDevices(audioInputs);

      // Auto-select first device if none selected
      if (!selectedDeviceId && audioInputs.length > 0) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  };

  // Load devices on mount
  useEffect(() => {
    refreshDevices();
  }, []);

  // Setup microphone with selected device
  useEffect(() => {
    if (!audioContext) return;

    // If no device selected and we have devices, don't setup yet (waiting for user selection)
    // But if we have no devices list yet, we should setup to trigger permission request
    if (!selectedDeviceId && devices.length > 0) return;

    const setupMicrophone = async () => {
      try {
        // Stop previous stream if exists
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
        }

        // Build audio constraints - treat 'default'/null/empty as "let browser pick"
        const audioConstraints: boolean | MediaTrackConstraints = selectedDeviceId && selectedDeviceId !== 'default'
          ? { deviceId: { exact: selectedDeviceId } }
          : true;  // No device constraint - let browser pick default

        // Request microphone access with specific device
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints
        });
        mediaStreamRef.current = mediaStream;

        // Refresh device list now that we have permission
        await refreshDevices();

        // Create source from media stream
        const sourceNode = audioContext.createMediaStreamSource(mediaStream);
        sourceNodeRef.current = sourceNode;

        // Create gain node (if not exists)
        if (!gainNodeRef.current) {
          const gainNode = audioContext.createGain();
          gainNode.gain.value = isMuted ? 0 : gain;
          gainNodeRef.current = gainNode;
        }

        // Connect source to gain
        sourceNode.connect(gainNodeRef.current);

        // Set output ref
        output.current = {
          audioNode: sourceNode,
          gain: gainNodeRef.current,
          context: audioContext,
          metadata: {
            label,
            sourceType: 'microphone',
          },
        };

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to access microphone');
        console.error('Microphone access error:', err);
      }
    };

    setupMicrophone();

    // Cleanup
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
      }
      output.current = null;
      sourceNodeRef.current = null;
      mediaStreamRef.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label, selectedDeviceId, devices.length]);

  // Update gain when it changes
  useEffect(() => {
    if (gainNodeRef.current && !isMuted) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain, isMuted]);

  // Update mute state
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : gain;
    }
  }, [isMuted, gain]);

  // Device selection handler
  const selectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
  };

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    selectDevice,
    refreshDevices,
    getState: () => ({ gain, isMuted, devices, selectedDeviceId, error }),
  }), [gain, isMuted, devices, selectedDeviceId, error]);

  // Event callback effects
  useEffect(() => {
    onDevicesChange?.(devices);
  }, [devices, onDevicesChange]);

  useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  if (error) {
    console.warn(`Microphone error: ${error}`);
  }

  // Render children with state
  if (children) {
    return <>{children({
      gain,
      setGain,
      isMuted,
      setMuted,
      devices,
      selectedDeviceId,
      selectDevice,
      refreshDevices,
      isActive: !!output.current,
      error,
    })}</>;
  }

  return null;
});

Microphone.displayName = 'Microphone';
