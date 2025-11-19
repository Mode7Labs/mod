import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface AudioDevice {
  deviceId: string;
  label: string;
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
  children?: (props: MicrophoneRenderProps) => ReactNode;
}

export const Microphone: React.FC<MicrophoneProps> = ({
  output,
  label = 'microphone',
  deviceId: initialDeviceId,
  children,
}) => {
  const audioContext = useAudioContext();
  const [gain, setGain] = useState(1.0);
  const [isMuted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(initialDeviceId || null);

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
    if (!audioContext || !selectedDeviceId) return;

    const setupMicrophone = async () => {
      try {
        // Stop previous stream if exists
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect();
        }

        // Request microphone access with specific device
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedDeviceId } }
        });
        mediaStreamRef.current = mediaStream;

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
  }, [audioContext, label, selectedDeviceId]);

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
};
