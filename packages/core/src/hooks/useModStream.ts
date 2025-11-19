import { useRef } from 'react';
import { ModStreamRef } from '../types/ModStream';

export const useModStream = (label?: string): ModStreamRef => {
  const ref = useRef<any>(null);

  // Store label for debugging purposes
  if (label && !ref.current?._label) {
    (ref as any)._label = label;
  }

  return ref as ModStreamRef;
};
