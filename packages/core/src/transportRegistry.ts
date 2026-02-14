import { TransportBus } from './transportBus';
import { WorkletTransport } from './transportWorklet';

export interface SharedTransportEntry {
  transport: WorkletTransport;
  bus: TransportBus;
  refs: number;
}

const sharedTransports = new WeakMap<AudioContext, SharedTransportEntry>();
const sharedTransportLoaders = new WeakMap<AudioContext, Promise<SharedTransportEntry>>();

export const acquireSharedTransport = async (
  context: AudioContext
): Promise<SharedTransportEntry> => {
  const existing = sharedTransports.get(context);
  if (existing) {
    existing.refs += 1;
    return existing;
  }

  let loader = sharedTransportLoaders.get(context);
  if (!loader) {
    loader = WorkletTransport.create(context, { bpm: 120, startBeat: 0, tickIntervalSec: 0.025 })
      .then((transport) => {
        const entry: SharedTransportEntry = {
          transport,
          bus: new TransportBus(transport),
          refs: 0,
        };
        sharedTransports.set(context, entry);
        sharedTransportLoaders.delete(context);
        return entry;
      })
      .catch((err) => {
        sharedTransportLoaders.delete(context);
        throw err;
      });
    sharedTransportLoaders.set(context, loader);
  }

  const entry = await loader;
  entry.refs += 1;
  return entry;
};

export const releaseSharedTransport = (context: AudioContext): void => {
  const entry = sharedTransports.get(context);
  if (!entry) return;
  entry.refs = Math.max(0, entry.refs - 1);
  if (entry.refs === 0) {
    entry.bus.dispose();
    entry.transport.dispose();
    sharedTransports.delete(context);
  }
};
