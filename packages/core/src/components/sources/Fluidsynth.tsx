import React, { ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useAudioContext } from '../../context/AudioContext';
import { ModStreamRef } from '../../types/ModStream';
import { MidiEvent } from '../../types/Midi';
import { useControlledState } from '../../hooks/useControlledState';

type AnySynth = {
  init?: (sampleRate: number) => Promise<void> | void;
  loadSFont?: (data: ArrayBuffer) => Promise<void> | void;
  loadSoundFont?: (data: ArrayBuffer) => Promise<void> | void;
  loadMIDI?: (data: ArrayBuffer) => Promise<void> | void;
  loadMidiFile?: (data: ArrayBuffer) => Promise<void> | void;
  addSMFDataToPlayer?: (data: ArrayBuffer) => Promise<void> | void;
  playPlayer?: () => Promise<void> | void;
  stopPlayer?: () => void;
  waitForPlayerStopped?: () => Promise<void> | void;
  isPlayerPlaying?: () => boolean;
  play?: () => Promise<void> | void;
  start?: () => Promise<void> | void;
  stop?: () => void;
  pause?: () => void;
  reset?: () => void;
  midiNoteOn?: (chan: number, key: number, vel: number) => void;
  midiNoteOff?: (chan: number, key: number) => void;
  midiProgramChange?: (chan: number, prognum: number) => void;
  midiControl?: (chan: number, ctrl: number, val: number) => void;
  midiPitchBend?: (chan: number, val: number) => void;
  midiAllNotesOff?: (chan?: number) => void;
  midiAllSoundsOff?: (chan?: number) => void;
  createAudioNode?: (context: AudioContext) => Promise<AudioNode> | AudioNode;
  createWebAudioNode?: (context: AudioContext) => Promise<AudioNode> | AudioNode;
  getAudioNode?: () => AudioNode | null;
  node?: AudioNode | null;
  audioNode?: AudioNode | null;
  output?: AudioNode | null;
  destroy?: () => void;
  close?: () => void;
  terminate?: () => void;
};

const dataUrlToArrayBuffer = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.arrayBuffer();
};

export interface FluidsynthHandle {
  loadSoundFontFile: (file: File) => void;
}

export interface FluidsynthRenderProps {
  wasmBaseUrl: string;
  setWasmBaseUrl: (url: string) => void;
  soundFontUrl: string;
  setSoundFontUrl: (url: string) => void;
  soundFontFileName: string;
  setSoundFontFileName: (name: string) => void;
  soundFontFileDataUrl: string;
  setSoundFontFileDataUrl: (dataUrl: string) => void;
  loadSoundFontFile: (file: File) => void;
  gain: number;
  setGain: (value: number) => void;
  isReady: boolean;
  isSoundFontLoaded: boolean;
  isSoundFontLoading: boolean;
  error: string | null;
  allNotesOff: () => void;
}

export interface FluidsynthProps {
  output: ModStreamRef;
  midiInput?: ModStreamRef;
  label?: string;
  wasmBaseUrl?: string;
  onWasmBaseUrlChange?: (url: string) => void;
  soundFontUrl?: string;
  onSoundFontUrlChange?: (url: string) => void;
  soundFontFileName?: string;
  onSoundFontFileNameChange?: (name: string) => void;
  soundFontFileDataUrl?: string;
  onSoundFontFileDataUrlChange?: (dataUrl: string) => void;
  gain?: number;
  onGainChange?: (value: number) => void;
  children?: (props: FluidsynthRenderProps) => ReactNode;
}

const DEFAULT_SOUNDFONT_URL = typeof document === 'undefined'
  ? '/sf2/microgm.sf2'
  : new URL('sf2/microgm.sf2', document.baseURI || window.location.href).toString();

export const Fluidsynth = React.forwardRef<FluidsynthHandle, FluidsynthProps>(({
  output,
  midiInput,
  label = 'fluidsynth',
  wasmBaseUrl: controlledWasmBaseUrl,
  onWasmBaseUrlChange,
  soundFontUrl: controlledSoundFontUrl,
  onSoundFontUrlChange,
  soundFontFileName: controlledSoundFontFileName,
  onSoundFontFileNameChange,
  soundFontFileDataUrl: controlledSoundFontFileDataUrl,
  onSoundFontFileDataUrlChange,
  gain: controlledGain,
  onGainChange,
  children,
}, ref) => {
  const audioContext = useAudioContext();
  const [wasmBaseUrl, setWasmBaseUrl] = useControlledState(
    controlledWasmBaseUrl,
    '',
    onWasmBaseUrlChange
  );
  const [soundFontUrl, setSoundFontUrl] = useControlledState(
    controlledSoundFontUrl,
    DEFAULT_SOUNDFONT_URL,
    onSoundFontUrlChange
  );
  const [soundFontFileName, setSoundFontFileName] = useControlledState(
    controlledSoundFontFileName,
    '',
    onSoundFontFileNameChange
  );
  const [soundFontFileDataUrl, setSoundFontFileDataUrl] = useControlledState(
    controlledSoundFontFileDataUrl,
    '',
    onSoundFontFileDataUrlChange
  );
  const [gain, setGain] = useControlledState(controlledGain, 1.0, onGainChange);
  const [isSoundFontLoaded, setIsSoundFontLoaded] = useState(false);
  const [isSoundFontLoading, setIsSoundFontLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const synthRef = useRef<AnySynth | null>(null);
  const synthInitRef = useRef<Promise<AnySynth> | null>(null);
  const synthNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const isReady = isSoundFontLoaded;

  const resolveAudioNode = async (synth: AnySynth) => {
    if (synth.createAudioNode) {
      if (synth.createAudioNode.length >= 2) {
        return await (synth.createAudioNode as any)(audioContext!, 8192);
      }
      return await synth.createAudioNode(audioContext!);
    }
    if (synth.createWebAudioNode) {
      return await synth.createWebAudioNode(audioContext!);
    }
    if (synth.getAudioNode) {
      return synth.getAudioNode();
    }
    return synth.node || synth.audioNode || synth.output || null;
  };

  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-midi-synth="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any)._loaded) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.midiSynth = src;
    (script as any)._loaded = false;
    script.addEventListener('load', () => {
      (script as any)._loaded = true;
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });

  const ensureSynth = async () => {
    if (synthRef.current) return synthRef.current;
    if (!audioContext) throw new Error('AudioContext is not available');
    if (!synthInitRef.current) {
      synthInitRef.current = (async () => {
        const base = wasmBaseUrl ? (wasmBaseUrl.endsWith('/') ? wasmBaseUrl : `${wasmBaseUrl}/`) : '';
        const existingModule = (globalThis as any).Module || {};
        if (base) {
          (globalThis as any).Module = {
            ...existingModule,
            locateFile: (path: string) => `${base}${path}`,
          };
        } else {
          (globalThis as any).Module = existingModule;
        }
        const fluidsynthUrl = `${base}libfluidsynth-2.4.6.js`;
        const synthUrl = `${base}js-synthesizer.js`;
        const synthWorkletUrl = `${base}js-synthesizer.worklet.js`;
        await loadScript(fluidsynthUrl);
        await loadScript(synthUrl);
        const JSSynth = (globalThis as any).JSSynth;
        if (!JSSynth) {
          throw new Error('JSSynth is not available. Check wasmBaseUrl assets.');
        }
        if (JSSynth.Synthesizer?.initializeWithFluidSynthModule && (globalThis as any).Module) {
          JSSynth.Synthesizer.initializeWithFluidSynthModule((globalThis as any).Module);
        }
        if (JSSynth.waitForReady) {
          await JSSynth.waitForReady();
        }
        let useWorklet = false;
        if (audioContext.audioWorklet && JSSynth.AudioWorkletNodeSynthesizer) {
          try {
            await audioContext.audioWorklet.addModule(fluidsynthUrl);
            await audioContext.audioWorklet.addModule(synthWorkletUrl);
            useWorklet = true;
          } catch {
            useWorklet = false;
          }
        }
        const synth: AnySynth = useWorklet
          ? new JSSynth.AudioWorkletNodeSynthesizer()
          : new JSSynth.Synthesizer();
        if (synth.init) {
          await synth.init(audioContext.sampleRate);
        }
        const node = await resolveAudioNode(synth);
        if (!node) {
          throw new Error('Synthesizer audio output not available');
        }
        synthNodeRef.current = node;
        if (gainNodeRef.current) {
          node.connect(gainNodeRef.current);
        }
        synthRef.current = synth;
        return synth;
      })();
    }
    return synthInitRef.current;
  };

  const loadSoundFont = async (buffer: ArrayBuffer) => {
    const synth = await ensureSynth();
    if (synth.loadSFont) {
      await synth.loadSFont(buffer);
    } else if (synth.loadSoundFont) {
      await synth.loadSoundFont(buffer);
    } else {
      throw new Error('SoundFont loading is not supported by the synthesizer');
    }
    setIsSoundFontLoaded(true);
  };

  const loadSoundFontFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        if (dataUrl) {
          setSoundFontFileName(file.name);
          setSoundFontFileDataUrl(dataUrl);
          const buffer = await dataUrlToArrayBuffer(dataUrl);
          await loadSoundFont(buffer);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SoundFont');
      }
    };
    reader.onerror = () => {
      setError('Failed to read SoundFont file');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!audioContext) return;
    const gainNode = audioContext.createGain();
    gainNode.gain.value = gain;
    gainNodeRef.current = gainNode;

    output.current = {
      audioNode: gainNode,
      gain: gainNode,
      context: audioContext,
      metadata: {
        label,
        sourceType: 'midi',
      },
    };

    if (synthNodeRef.current) {
      synthNodeRef.current.connect(gainNode);
    }

    return () => {
      if (synthNodeRef.current) {
        try { synthNodeRef.current.disconnect(); } catch (e) {}
      }
      gainNode.disconnect();
      output.current = null;
      gainNodeRef.current = null;
    };
  }, [audioContext, label]);

  useEffect(() => {
    if (!audioContext || !midiInput) return;
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    const attach = async () => {
      try {
        const synth = await ensureSynth();
        if (cancelled) return;
        const bus = midiInput.current?.midi;
        if (!bus) return;
        unsubscribe = bus.subscribe((event: MidiEvent) => {
          if (!isSoundFontLoaded) return;
          switch (event.type) {
            case 'noteOn':
              synth.midiNoteOn?.(event.channel, event.note, event.velocity);
              break;
            case 'noteOff':
              synth.midiNoteOff?.(event.channel, event.note);
              break;
            case 'program':
              synth.midiProgramChange?.(event.channel, event.program);
              break;
            case 'cc':
              synth.midiControl?.(event.channel, event.controller, event.value);
              break;
            case 'pitchBend':
              synth.midiPitchBend?.(event.channel, event.value);
              break;
            case 'allNotesOff':
              synth.midiAllNotesOff?.(event.channel);
              break;
            case 'allSoundsOff':
              synth.midiAllSoundsOff?.(event.channel);
              break;
          }
        });
      } catch {
        // Ignore MIDI attach failures.
      }
    };
    attach();
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [audioContext, midiInput, isSoundFontLoaded]);

  const allNotesOff = async () => {
    try {
      const synth = await ensureSynth();
      synth.midiAllNotesOff?.();
      synth.midiAllSoundsOff?.();
    } catch {
      // Ignore.
    }
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  useEffect(() => {
    setIsSoundFontLoaded(false);
    if (!soundFontUrl || soundFontFileDataUrl) return;
    const load = async () => {
      try {
        setIsSoundFontLoading(true);
        setError(null);
        const response = await fetch(soundFontUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch SoundFont');
        }
        const buffer = await response.arrayBuffer();
        await loadSoundFont(buffer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SoundFont');
      } finally {
        setIsSoundFontLoading(false);
      }
    };
    load();
  }, [soundFontUrl]);

  useEffect(() => {
    setIsSoundFontLoaded(false);
    if (!soundFontFileDataUrl) return;
    const load = async () => {
      try {
        setIsSoundFontLoading(true);
        setError(null);
        const buffer = await dataUrlToArrayBuffer(soundFontFileDataUrl);
        await loadSoundFont(buffer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load SoundFont');
      } finally {
        setIsSoundFontLoading(false);
      }
    };
    load();
  }, [soundFontFileDataUrl]);

  useImperativeHandle(ref, () => ({
    loadSoundFontFile,
  }), []);

  if (children) {
    return (
      <>
        {children({
          wasmBaseUrl,
          setWasmBaseUrl,
          soundFontUrl,
          setSoundFontUrl,
          soundFontFileName,
          setSoundFontFileName,
          soundFontFileDataUrl,
          setSoundFontFileDataUrl,
          loadSoundFontFile,
          gain,
          setGain,
          isReady,
          isSoundFontLoaded,
          isSoundFontLoading,
          error,
          allNotesOff,
        })}
      </>
    );
  }

  return null;
});

Fluidsynth.displayName = 'Fluidsynth';
