import React from 'react';
import {
  // Sources
  ToneGenerator,
  NoiseGenerator,
  Microphone,
  MP3Deck,
  StreamingAudioDeck,
  // CV
  LFO,
  ADSR,
  Sequencer,
  Clock,
  // Processors
  Filter,
  Delay,
  Reverb,
  Compressor,
  Distortion,
  Panner,
  EQ,
  Chorus,
  Phaser,
  Flanger,
  Tremolo,
  BitCrusher,
  Limiter,
  Gate,
  AutoWah,
  RingModulator,
  // Mixers
  CrossFade,
  Mixer,
  // Output
  Monitor,
  // Visualizations
  Oscilloscope,
  SpectrumAnalyzer,
  LevelMeter,
} from '@mode-7/mod';
import { Volume2, VolumeX, Play, Pause, RefreshCw, Mic, MicOff, Square, Upload, Repeat, Zap, X, RotateCcw } from 'lucide-react';
import { Slider } from './controls/Slider';
import { Select } from './controls/Select';
import { IconButton } from './controls/IconButton';
import { FileUpload } from './controls/FileUpload';
import { TextInput } from './controls/TextInput';
import { OscilloscopeCanvas } from './visualizers/OscilloscopeCanvas';
import { SpectrumCanvas } from './visualizers/SpectrumCanvas';
import { LevelMeterCanvas } from './visualizers/LevelMeterCanvas';

interface ModuleRendererProps {
  moduleType: string;
  inputStreams: (React.RefObject<any> | null)[];
  outputStreams: React.RefObject<any>[];
  cvInputStreams: { [key: string]: React.RefObject<any> | null };
}

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({
  moduleType,
  inputStreams,
  outputStreams,
  cvInputStreams,
}) => {
  const input = inputStreams[0];
  const input2 = inputStreams[1];
  const input3 = inputStreams[2];
  const input4 = inputStreams[3];
  const output = outputStreams[0];

  // Get CV input (just get the first one since each component only has one CV port)
  const cv = Object.values(cvInputStreams).find(stream => stream !== null) || undefined;

  switch (moduleType) {
    case 'ToneGenerator':
      return output ? (
        <ToneGenerator output={output} cv={cv}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Frequency"
                value={controls.frequency}
                onChange={controls.setFrequency}
                min={20}
                max={2000}
                step={1}
                unit=" Hz"
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <Slider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Select
                value={controls.waveform}
                onValueChange={(v) => controls.setWaveform(v as any)}
                options={[
                  { value: 'sine', label: 'Sine' },
                  { value: 'square', label: 'Square' },
                  { value: 'sawtooth', label: 'Sawtooth' },
                  { value: 'triangle', label: 'Triangle' },
                ]}
              />
            </div>
          )}
        </ToneGenerator>
      ) : null;

    case 'NoiseGenerator':
      return output ? (
        <NoiseGenerator output={output} cv={cv}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Select
                value={controls.type}
                onValueChange={(v) => controls.setType(v as any)}
                options={[
                  { value: 'white', label: 'White' },
                  { value: 'pink', label: 'Pink' },
                ]}
              />
            </div>
          )}
        </NoiseGenerator>
      ) : null;

    case 'Microphone':
      return output ? (
        <Microphone output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Select
                value={controls.selectedDeviceId || '__default__'}
                onValueChange={(deviceId) => controls.selectDevice(deviceId === '__default__' ? '' : deviceId)}
                options={[
                  { value: '__default__', label: 'Default Device' },
                  ...controls.devices
                    .filter(device => device.deviceId) // Filter out devices with empty deviceId
                    .map(device => ({
                      value: device.deviceId,
                      label: device.label || 'Unknown Device'
                    }))
                ]}
                placeholder="Select Input Device"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton
                  icon={controls.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  active={controls.isMuted}
                  onClick={() => controls.setMuted(!controls.isMuted)}
                  variant="danger"
                  title={controls.isMuted ? 'Unmute' : 'Mute'}
                />
                <IconButton
                  icon={<RefreshCw size={16} />}
                  onClick={() => controls.refreshDevices()}
                  title="Refresh Input Devices"
                />
              </div>
            </div>
          )}
        </Microphone>
      ) : null;

    case 'Monitor':
      return (
        <Monitor input={input || { current: null }}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Volume"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Select
                value={controls.selectedDeviceId || '__default__'}
                onValueChange={(deviceId) => controls.selectDevice(deviceId === '__default__' ? '' : deviceId)}
                options={[
                  { value: '__default__', label: 'Default Device' },
                  ...controls.devices
                    .filter(device => device.deviceId) // Filter out devices with empty deviceId
                    .map(device => ({
                      value: device.deviceId,
                      label: device.label || 'Unknown Device'
                    }))
                ]}
                placeholder="Select Output Device"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton
                  icon={controls.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  active={controls.isMuted}
                  onClick={() => controls.setMuted(!controls.isMuted)}
                  variant="danger"
                  title={controls.isMuted ? 'Unmute' : 'Mute'}
                />
                <IconButton
                  icon={<RefreshCw size={16} />}
                  onClick={() => controls.refreshDevices()}
                  title="Refresh Output Devices"
                />
              </div>
            </div>
          )}
        </Monitor>
      );

    case 'Filter':
      return output ? (
        <Filter input={input || { current: null }} output={output} cv={cv}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Frequency"
                value={controls.frequency}
                onChange={controls.setFrequency}
                min={20}
                max={20000}
                step={10}
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <Slider
                label="Q"
                value={controls.Q}
                onChange={controls.setQ}
                min={0.0001}
                max={30}
                step={0.1}
                formatValue={(v) => v.toFixed(2)}
              />
              <Select
                value={controls.type}
                onValueChange={(v) => controls.setType(v as any)}
                options={[
                  { value: 'lowpass', label: 'Low Pass' },
                  { value: 'highpass', label: 'High Pass' },
                  { value: 'bandpass', label: 'Band Pass' },
                  { value: 'lowshelf', label: 'Low Shelf' },
                  { value: 'highshelf', label: 'High Shelf' },
                  { value: 'peaking', label: 'Peaking' },
                  { value: 'notch', label: 'Notch' },
                  { value: 'allpass', label: 'All Pass' },
                ]}
                placeholder="Filter Type"
              />
            </div>
          )}
        </Filter>
      ) : null;

    case 'Delay':
      return output ? (
        <Delay input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Time"
                value={controls.time}
                onChange={controls.setTime}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => `${v.toFixed(2)}s`}
              />
              <Slider
                label="Feedback"
                value={controls.feedback}
                onChange={controls.setFeedback}
                min={0}
                max={0.9}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Slider
                label="Wet"
                value={controls.wet}
                onChange={controls.setWet}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </Delay>
      ) : null;

    case 'Reverb':
      return output ? (
        <Reverb input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Wet"
                value={controls.wet}
                onChange={controls.setWet}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Slider
                label="Duration"
                value={controls.duration}
                onChange={controls.setDuration}
                min={0.1}
                max={5}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)}s`}
              />
              <Slider
                label="Decay"
                value={controls.decay}
                onChange={controls.setDecay}
                min={0.1}
                max={5}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)}s`}
              />
            </div>
          )}
        </Reverb>
      ) : null;

    case 'Compressor':
      return output ? (
        <Compressor input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Threshold"
                value={controls.threshold}
                onChange={controls.setThreshold}
                min={-100}
                max={0}
                step={1}
                formatValue={(v) => `${v.toFixed(0)} dB`}
              />
              <Slider
                label="Ratio"
                value={controls.ratio}
                onChange={controls.setRatio}
                min={1}
                max={20}
                step={0.1}
                formatValue={(v) => `${v.toFixed(1)}:1`}
              />
            </div>
          )}
        </Compressor>
      ) : null;

    case 'Distortion':
      return output ? (
        <Distortion input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Amount"
                value={controls.amount}
                onChange={controls.setAmount}
                min={0}
                max={100}
                step={1}
                formatValue={(v) => v.toFixed(0)}
              />
            </div>
          )}
        </Distortion>
      ) : null;

    case 'Panner':
      return output ? (
        <Panner input={input || { current: null }} output={output} cv={cv}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Pan"
                value={controls.pan}
                onChange={controls.setPan}
                min={-1}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </Panner>
      ) : null;

    case 'CrossFade':
      return output ? (
        <CrossFade inputs={[input || { current: null }, input2 || { current: null }]} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Mix"
                value={controls.mix}
                onChange={controls.setMix}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Select
                value={controls.mode}
                onValueChange={(v) => controls.setMode(v as any)}
                options={[
                  { value: 'linear', label: 'Linear' },
                  { value: 'equal-power', label: 'Equal Power' },
                  { value: 'equal-gain', label: 'Equal Gain' },
                  { value: 'exponential', label: 'Exponential' },
                  { value: 'dj-cut', label: 'DJ Cut' },
                  { value: 'smooth-step', label: 'Smooth Step' },
                ]}
                placeholder="Crossfade Mode"
              />
            </div>
          )}
        </CrossFade>
      ) : null;

    case 'Mixer':
      return output ? (
        <Mixer inputs={[
          inputStreams[0] || { current: null },
          inputStreams[1] || { current: null },
          inputStreams[2] || { current: null },
          inputStreams[3] || { current: null }
        ]} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {controls.levels.map((level, i) => (
                <Slider
                  key={i}
                  label={`Ch${i + 1}`}
                  value={level}
                  onChange={(value) => controls.setLevel(i, value)}
                  min={0}
                  max={1}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
              ))}
            </div>
          )}
        </Mixer>
      ) : null;

    case 'EQ':
      return output ? (
        <EQ input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Slider
                label="Low"
                value={controls.lowGain}
                onChange={controls.setLowGain}
                min={-40}
                max={40}
                step={1}
                formatValue={(v) => `${v.toFixed(1)} dB`}
              />
              <Slider
                label="Mid"
                value={controls.midGain}
                onChange={controls.setMidGain}
                min={-40}
                max={40}
                step={1}
                formatValue={(v) => `${v.toFixed(1)} dB`}
              />
              <Slider
                label="High"
                value={controls.highGain}
                onChange={controls.setHighGain}
                min={-40}
                max={40}
                step={1}
                formatValue={(v) => `${v.toFixed(1)} dB`}
              />
            </div>
          )}
        </EQ>
      ) : null;

    case 'Chorus':
      return output ? (
        <Chorus input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Rate"
                value={controls.rate}
                onChange={controls.setRate}
                min={0.1}
                max={10}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)} Hz`}
              />
              <Slider
                label="Depth"
                value={controls.depth}
                onChange={controls.setDepth}
                min={0}
                max={0.01}
                step={0.0001}
                formatValue={(v) => v.toFixed(4)}
              />
              <Slider
                label="Wet"
                value={controls.wet}
                onChange={controls.setWet}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </Chorus>
      ) : null;

    case 'Phaser':
      return output ? (
        <Phaser input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Rate"
                value={controls.rate}
                onChange={controls.setRate}
                min={0.1}
                max={10}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)} Hz`}
              />
              <Slider
                label="Depth"
                value={controls.depth}
                onChange={controls.setDepth}
                min={0}
                max={2000}
                step={10}
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <Slider
                label="Feedback"
                value={controls.feedback}
                onChange={controls.setFeedback}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </Phaser>
      ) : null;

    case 'Flanger':
      return output ? (
        <Flanger input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Rate"
                value={controls.rate}
                onChange={controls.setRate}
                min={0.1}
                max={10}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)} Hz`}
              />
              <Slider
                label="Depth"
                value={controls.depth}
                onChange={controls.setDepth}
                min={0}
                max={0.01}
                step={0.0001}
                formatValue={(v) => v.toFixed(4)}
              />
              <Slider
                label="Feedback"
                value={controls.feedback}
                onChange={controls.setFeedback}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </Flanger>
      ) : null;

    case 'Tremolo':
      return output ? (
        <Tremolo input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Rate"
                value={controls.rate}
                onChange={controls.setRate}
                min={0.1}
                max={20}
                step={0.1}
                formatValue={(v) => `${v.toFixed(1)} Hz`}
              />
              <Slider
                label="Depth"
                value={controls.depth}
                onChange={controls.setDepth}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </Tremolo>
      ) : null;

    case 'BitCrusher':
      return output ? (
        <BitCrusher input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Bit Depth"
                value={controls.bitDepth}
                onChange={controls.setBitDepth}
                min={1}
                max={16}
                step={1}
                formatValue={(v) => v.toFixed(0)}
              />
              <Slider
                label="Sample Reduction"
                value={controls.sampleReduction}
                onChange={controls.setSampleReduction}
                min={1}
                max={50}
                step={1}
                formatValue={(v) => v.toFixed(0)}
              />
            </div>
          )}
        </BitCrusher>
      ) : null;

    case 'Limiter':
      return output ? (
        <Limiter input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Threshold"
                value={controls.threshold}
                onChange={controls.setThreshold}
                min={-20}
                max={0}
                step={0.1}
                formatValue={(v) => `${v.toFixed(1)} dB`}
              />
              <Slider
                label="Release"
                value={controls.release}
                onChange={controls.setRelease}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
            </div>
          )}
        </Limiter>
      ) : null;

    case 'Gate':
      return output ? (
        <Gate input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Threshold"
                value={controls.threshold}
                onChange={controls.setThreshold}
                min={-100}
                max={0}
                step={1}
                formatValue={(v) => `${v.toFixed(0)} dB`}
              />
              <Slider
                label="Attack"
                value={controls.attack}
                onChange={controls.setAttack}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <Slider
                label="Release"
                value={controls.release}
                onChange={controls.setRelease}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
            </div>
          )}
        </Gate>
      ) : null;

    case 'AutoWah':
      return output ? (
        <AutoWah input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Sensitivity"
                value={controls.sensitivity}
                onChange={controls.setSensitivity}
                min={0}
                max={5000}
                step={10}
                formatValue={(v) => v.toFixed(0)}
              />
              <Slider
                label="Base Freq"
                value={controls.baseFreq}
                onChange={controls.setBaseFreq}
                min={50}
                max={1000}
                step={10}
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <Slider
                label="Q"
                value={controls.Q}
                onChange={controls.setQ}
                min={1}
                max={30}
                step={0.1}
                formatValue={(v) => v.toFixed(1)}
              />
            </div>
          )}
        </AutoWah>
      ) : null;

    case 'RingModulator':
      return output ? (
        <RingModulator input={input || { current: null }} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Frequency"
                value={controls.frequency}
                onChange={controls.setFrequency}
                min={20}
                max={2000}
                step={1}
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <Slider
                label="Wet"
                value={controls.wet}
                onChange={controls.setWet}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
            </div>
          )}
        </RingModulator>
      ) : null;

    case 'LFO':
      return output ? (
        <LFO output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="Frequency"
                value={controls.frequency}
                onChange={controls.setFrequency}
                min={0.1}
                max={20}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)} Hz`}
              />
              <Slider
                label="Amplitude"
                value={controls.amplitude}
                onChange={controls.setAmplitude}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Select
                value={controls.waveform}
                onValueChange={(v) => controls.setWaveform(v as any)}
                options={[
                  { value: 'sine', label: 'Sine' },
                  { value: 'square', label: 'Square' },
                  { value: 'sawtooth', label: 'Sawtooth' },
                  { value: 'triangle', label: 'Triangle' },
                ]}
              />
            </div>
          )}
        </LFO>
      ) : null;

    case 'ADSR':
      return output ? (
        <ADSR gate={cv} output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Slider
                label="Attack"
                value={controls.attack}
                onChange={controls.setAttack}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <Slider
                label="Decay"
                value={controls.decay}
                onChange={controls.setDecay}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <Slider
                label="Sustain"
                value={controls.sustain}
                onChange={controls.setSustain}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <Slider
                label="Release"
                value={controls.release}
                onChange={controls.setRelease}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton
                  icon={<Zap size={16} />}
                  onClick={controls.trigger}
                  variant="success"
                  title="Trigger"
                />
                <IconButton
                  icon={<X size={16} />}
                  onClick={controls.releaseGate}
                  variant="danger"
                  title="Release"
                />
              </div>
            </div>
          )}
        </ADSR>
      ) : null;

    case 'Sequencer':
      return output ? (
        <Sequencer output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="BPM"
                value={controls.bpm}
                onChange={controls.setBpm}
                min={20}
                max={300}
                step={1}
                formatValue={(v) => v.toFixed(0)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {controls.steps.map((step, i) => (
                  <Slider
                    key={i}
                    label={`Step ${i + 1}`}
                    value={step}
                    onChange={(value) => {
                      const newSteps = [...controls.steps];
                      newSteps[i] = value;
                      controls.setSteps(newSteps);
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    formatValue={(v) => v.toFixed(2)}
                    labelColor={i === controls.currentStep ? '#4CAF50' : undefined}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton
                  icon={controls.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  active={controls.isPlaying}
                  onClick={controls.isPlaying ? controls.pause : controls.play}
                  variant="success"
                  title={controls.isPlaying ? 'Pause' : 'Play'}
                />
                <IconButton
                  icon={<RotateCcw size={16} />}
                  onClick={controls.reset}
                  title="Reset"
                />
              </div>
            </div>
          )}
        </Sequencer>
      ) : null;

    case 'Clock':
      return output ? (
        <Clock output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Slider
                label="BPM"
                value={controls.bpm}
                onChange={controls.setBpm}
                min={20}
                max={300}
                step={1}
                formatValue={(v) => v.toFixed(0)}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton
                  icon={controls.isRunning ? <Pause size={16} /> : <Play size={16} />}
                  active={controls.isRunning}
                  onClick={controls.isRunning ? controls.stop : controls.start}
                  variant="success"
                  title={controls.isRunning ? 'Stop' : 'Start'}
                />
                <IconButton
                  icon={<RotateCcw size={16} />}
                  onClick={controls.reset}
                  title="Reset"
                />
              </div>
            </div>
          )}
        </Clock>
      ) : null;

    case 'MP3Deck':
      return output ? (
        <MP3Deck output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <FileUpload
                onFileSelect={(file) => controls.loadFile(file)}
                accept="audio/*"
                label="Load Audio"
              />
              <Slider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton
                  icon={controls.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  active={controls.isPlaying}
                  onClick={controls.isPlaying ? controls.pause : controls.play}
                  variant="success"
                  title={controls.isPlaying ? 'Pause' : 'Play'}
                />
                <IconButton
                  icon={<Square size={16} />}
                  onClick={controls.stop}
                  title="Stop"
                />
                <IconButton
                  icon={<Repeat size={16} />}
                  active={controls.loop}
                  onClick={() => controls.setLoop(!controls.loop)}
                  title="Loop"
                />
              </div>
            </div>
          )}
        </MP3Deck>
      ) : null;

    case 'StreamingAudioDeck':
      return output ? (
        <StreamingAudioDeck output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <TextInput
                value={controls.url}
                onChange={controls.setUrl}
                placeholder="Stream URL"
                label="URL"
              />
              <Slider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <IconButton
                  icon={controls.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  active={controls.isPlaying}
                  onClick={controls.isPlaying ? controls.pause : controls.play}
                  variant="success"
                  title={controls.isPlaying ? 'Pause' : 'Play'}
                />
              </div>
            </div>
          )}
        </StreamingAudioDeck>
      ) : null;

    case 'Oscilloscope':
      return input ? (
        <Oscilloscope input={input}>
          {({ dataArray, bufferLength, isActive }) => (
            <div style={{ width: '100%', height: '150px', backgroundColor: '#0a0a0a', borderRadius: '4px', overflow: 'hidden' }}>
              {isActive ? (
                <OscilloscopeCanvas
                  dataArray={dataArray}
                  bufferLength={bufferLength}
                  color="#00ff88"
                  lineWidth={2}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: '12px' }}>
                  No Signal
                </div>
              )}
            </div>
          )}
        </Oscilloscope>
      ) : (
        <div style={{ width: '100%', height: '150px', backgroundColor: '#0a0a0a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px', border: '1px solid #1a1a1a' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '4px', opacity: 0.5 }}>───────</div>
            <div>No Signal</div>
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>Connect Input</div>
          </div>
        </div>
      );

    case 'SpectrumAnalyzer':
      return input ? (
        <SpectrumAnalyzer input={input}>
          {({ dataArray, bufferLength, isActive }) => (
            <div style={{ width: '100%', height: '150px', backgroundColor: '#0a0a0a', borderRadius: '4px', overflow: 'hidden' }}>
              {isActive ? (
                <SpectrumCanvas
                  dataArray={dataArray}
                  bufferLength={bufferLength}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: '12px' }}>
                  No Signal
                </div>
              )}
            </div>
          )}
        </SpectrumAnalyzer>
      ) : (
        <div style={{ width: '100%', height: '150px', backgroundColor: '#0a0a0a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px', border: '1px solid #1a1a1a' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '4px', opacity: 0.5 }}>▂▃▅▇█▇▅▃▂</div>
            <div>No Signal</div>
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>Connect Input</div>
          </div>
        </div>
      );

    case 'LevelMeter':
      return input ? (
        <LevelMeter input={input}>
          {({ level, peak, isClipping, isActive }) => (
            <div style={{ width: '100%', height: '60px', backgroundColor: '#0a0a0a', borderRadius: '4px', overflow: 'hidden' }}>
              {isActive ? (
                <LevelMeterCanvas
                  level={level}
                  peak={peak}
                  isClipping={isClipping}
                  orientation="horizontal"
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: '12px' }}>
                  No Signal
                </div>
              )}
            </div>
          )}
        </LevelMeter>
      ) : (
        <div style={{ width: '100%', height: '60px', backgroundColor: '#0a0a0a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px', border: '1px solid #1a1a1a' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '4px', opacity: 0.5 }}>━━━━━━━━━━</div>
            <div>No Signal</div>
            <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>Connect Input</div>
          </div>
        </div>
      );

    default:
      return <div style={{ fontSize: '10px', color: '#999' }}>No UI</div>;
  }
};
