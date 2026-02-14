import { MutableRefObject } from 'react';
import { MidiBus } from './Midi';
import type { TransportBus } from '../transportBus';

export interface ModStream {
  audioNode: AudioNode;
  gain: GainNode;
  context: AudioContext;
  midi?: MidiBus;
  transport?: TransportBus;
  metadata: {
    label?: string;
    sourceType?: 'microphone' | 'mp3' | 'stream' | 'tone' | 'sampler' | 'processor' | 'mixer' | 'cv' | 'midi';
  };
}

export type ModStreamRef = MutableRefObject<ModStream | null>;
