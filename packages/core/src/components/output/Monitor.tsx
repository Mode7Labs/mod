import { useEffect, useState, useRef, ReactNode } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';

export interface AudioOutputDevice {
  deviceId: string;
  label: string;
}

export interface MonitorRenderProps {
  gain: number;
  setGain: (value: number) => void;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  devices: AudioOutputDevice[];
  selectedDeviceId: string | null;
  selectDevice: (deviceId: string) => Promise<void>;
  refreshDevices: () => Promise<void>;
  isActive: boolean;
}

export interface MonitorProps {
  input: ModStreamRef;
  label?: string;
  deviceId?: string; // Optional: pre-select a device
  children?: (props: MonitorRenderProps) => ReactNode;
}

export const Monitor: React.FC<MonitorProps> = ({
  input,
  label = 'monitor',
  deviceId: initialDeviceId,
  children,
}) => {
  const audioContext = useAudioContext();
  const [gain, setGain] = useState(1.0);
  const [isMuted, setMuted] = useState(false);
  const [devices, setDevices] = useState<AudioOutputDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(initialDeviceId || null);

  const gainNodeRef = useRef<GainNode | null>(null);

  // Only recreate when specific input stream changes, not ref
  const inputKey = input.current?.audioNode ? String(input.current.audioNode) : 'null';

  // Get available audio output devices
  const refreshDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = allDevices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 5)}`,
        }));
      setDevices(audioOutputs);

      // Auto-select default device if none selected
      if (!selectedDeviceId && audioOutputs.length > 0) {
        setSelectedDeviceId('default');
      }
    } catch (err) {
      console.error('Failed to enumerate output devices:', err);
      // Fallback to default device
      setDevices([{ deviceId: 'default', label: 'Default Output' }]);
      setSelectedDeviceId('default');
    }
  };

  // Load devices on mount
  useEffect(() => {
    refreshDevices();
  }, []);

  // Setup audio routing
  useEffect(() => {
    if (!audioContext || !input.current) return;

    // Create output gain for volume control
    const outputGain = audioContext.createGain();
    outputGain.gain.value = isMuted ? 0 : gain;
    gainNodeRef.current = outputGain;

    // Connect input to output gain
    input.current.gain.connect(outputGain);

    // Connect to destination (speakers)
    outputGain.connect(audioContext.destination);

    // Cleanup
    return () => {
      outputGain.disconnect();
      gainNodeRef.current = null;
    };
  }, [audioContext, inputKey, label]);

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
  const selectDevice = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);

    // Use AudioContext.setSinkId() to change output device
    if (audioContext && 'setSinkId' in audioContext) {
      try {
        await (audioContext as any).setSinkId(deviceId);
        console.log('Selected output device:', deviceId);
      } catch (err) {
        console.error('Failed to set output device:', err);
      }
    } else {
      console.warn('AudioContext.setSinkId() not supported in this browser');
    }
  };

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
      isActive: !!gainNodeRef.current,
    })}</>;
  }

  return null;
};
