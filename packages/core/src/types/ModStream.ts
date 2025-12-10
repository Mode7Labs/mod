import { MutableRefObject } from 'react';

export interface ModStream {
  audioNode: AudioNode;
  gain: GainNode;
  context: AudioContext;
  metadata: {
    label?: string;
    sourceType?: 'microphone' | 'mp3' | 'stream' | 'tone' | 'sampler' | 'processor' | 'mixer' | 'cv';
  };
}

export type ModStreamRef = MutableRefObject<ModStream | null>;
