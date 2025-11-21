import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AudioProvider } from '../context/AudioContext';

// Wrapper component that provides AudioProvider context
function AudioProviderWrapper({ children }: { children: React.ReactNode }) {
  return <AudioProvider>{children}</AudioProvider>;
}

// Custom render function that wraps components with AudioProvider
export function renderWithAudio(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AudioProviderWrapper, ...options });
}

// Helper to create a mock ModStreamRef
export function createMockStreamRef() {
  return { current: null as any };
}

// Helper to wait for audio context to be ready
export async function waitForAudioContext() {
  await new Promise(resolve => setTimeout(resolve, 100));
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithAudio as render };
