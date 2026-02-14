import { MutableRefObject } from 'react';
import type { TransportBus } from '../transportBus';

export interface ModStream {
  audioNode: AudioNode;
  gain: GainNode;
  context: AudioContext;
  transport?: TransportBus;
  metadata: {
    label?: string;
    sourceType?: 'microphone' | 'mp3' | 'stream' | 'tone' | 'sampler' | 'processor' | 'mixer' | 'cv';
  };
}

export type ModStreamRef = MutableRefObject<ModStream | null>;
