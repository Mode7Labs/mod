export type MidiEvent =
  | { type: 'noteOn'; time: number; channel: number; note: number; velocity: number }
  | { type: 'noteOff'; time: number; channel: number; note: number; velocity?: number }
  | { type: 'cc'; time: number; channel: number; controller: number; value: number }
  | { type: 'program'; time: number; channel: number; program: number }
  | { type: 'pitchBend'; time: number; channel: number; value: number }
  | { type: 'allNotesOff'; time: number; channel?: number }
  | { type: 'allSoundsOff'; time: number; channel?: number };

export type MidiListener = (event: MidiEvent) => void;

export interface MidiBus {
  subscribe: (listener: MidiListener) => () => void;
  emit: (event: MidiEvent) => void;
}
