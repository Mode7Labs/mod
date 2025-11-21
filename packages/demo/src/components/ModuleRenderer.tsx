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
  VCA,
  // Mixers
  CrossFade,
  Mixer,
  // Output
  Monitor,
  // Visualizations
  Oscilloscope,
  SpectrumAnalyzer,
  LevelMeter,
  // ModUI
  Slider as ModUISlider,
  Knob,
  XYPad,
  Select as ModUISelect,
  Button as ModUIButton,
} from '@mode-7/mod';
import { Volume2, VolumeX, Play, Pause, RefreshCw, Mic, MicOff, Square, Upload, Repeat, Zap, X, RotateCcw } from 'lucide-react';
import {
  OscilloscopeCanvas,
  SpectrumAnalyzerCanvas,
  LevelMeterCanvas,
  FilePicker as ModUIFilePicker,
  TextInput as ModUITextInput,
  ProgressBar as ModUIProgressBar,
} from '@mode-7/mod';

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
  const output = outputStreams[0];

  // Get CV input (just get the first one since each component only has one CV port)
  const cv = Object.values(cvInputStreams).find(stream => stream !== null) || undefined;

  switch (moduleType) {
    case 'ToneGenerator':
      return output ? (
        <ToneGenerator output={output} cv={cv}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ModUISlider
                label="Frequency"
                value={controls.frequency}
                onChange={controls.setFrequency}
                min={20}
                max={2000}
                step={1}
                unit=" Hz"
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <ModUISlider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISelect
                value={controls.waveform}
                onChange={(v) => controls.setWaveform(v as any)}
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
              <ModUISlider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISelect
                value={controls.type}
                onChange={(v) => controls.setType(v as any)}
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
              <ModUISlider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISelect
                value={controls.selectedDeviceId || '__default__'}
                onChange={(deviceId) => controls.selectDevice(deviceId === '__default__' ? '' : deviceId)}
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
                <ModUIButton
                  icon={controls.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  active={controls.isMuted}
                  onClick={() => controls.setMuted(!controls.isMuted)}
                  variant="danger"
                  title={controls.isMuted ? 'Unmute' : 'Mute'}
                />
                <ModUIButton
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
              <ModUISlider
                label="Volume"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISelect
                value={controls.selectedDeviceId || '__default__'}
                onChange={(deviceId) => controls.selectDevice(deviceId === '__default__' ? '' : deviceId)}
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
                <ModUIButton
                  icon={controls.isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  active={controls.isMuted}
                  onClick={() => controls.setMuted(!controls.isMuted)}
                  variant="danger"
                  title={controls.isMuted ? 'Unmute' : 'Mute'}
                />
                <ModUIButton
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <XYPad
                valueX={controls.frequency}
                valueY={controls.Q}
                onChangeX={controls.setFrequency}
                onChangeY={controls.setQ}
                minX={20}
                maxX={20000}
                minY={0.0001}
                maxY={30}
                stepX={10}
                stepY={0.1}
                labelX="Freq"
                labelY="Q"
                formatValueX={(v) => `${v.toFixed(0)} Hz`}
                formatValueY={(v) => v.toFixed(2)}
                size={180}
              />
              <ModUISelect
                value={controls.type}
                onChange={(v) => controls.setType(v as any)}
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
              <ModUISlider
                label="Time"
                value={controls.time}
                onChange={controls.setTime}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => `${v.toFixed(2)}s`}
              />
              <ModUISlider
                label="Feedback"
                value={controls.feedback}
                onChange={controls.setFeedback}
                min={0}
                max={0.9}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISlider
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
              <ModUISlider
                label="Wet"
                value={controls.wet}
                onChange={controls.setWet}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISlider
                label="Duration"
                value={controls.duration}
                onChange={controls.setDuration}
                min={0.1}
                max={5}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)}s`}
              />
              <ModUISlider
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
              <ModUISlider
                label="Threshold"
                value={controls.threshold}
                onChange={controls.setThreshold}
                min={-100}
                max={0}
                step={1}
                formatValue={(v) => `${v.toFixed(0)} dB`}
              />
              <ModUISlider
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
              <ModUISlider
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
              <ModUISlider
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
              <ModUISlider
                label="Mix"
                value={controls.mix}
                onChange={controls.setMix}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISelect
                value={controls.mode}
                onChange={(v) => controls.setMode(v as any)}
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
                <ModUISlider
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
              <ModUISlider
                label="Low"
                value={controls.lowGain}
                onChange={controls.setLowGain}
                min={-40}
                max={40}
                step={1}
                formatValue={(v) => `${v.toFixed(1)} dB`}
              />
              <ModUISlider
                label="Mid"
                value={controls.midGain}
                onChange={controls.setMidGain}
                min={-40}
                max={40}
                step={1}
                formatValue={(v) => `${v.toFixed(1)} dB`}
              />
              <ModUISlider
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <XYPad
                valueX={controls.rate}
                valueY={controls.depth}
                onChangeX={controls.setRate}
                onChangeY={controls.setDepth}
                minX={0.1}
                maxX={10}
                minY={0}
                maxY={0.01}
                stepX={0.1}
                stepY={0.0001}
                labelX="Rate"
                labelY="Depth"
                formatValueX={(v) => `${v.toFixed(1)} Hz`}
                formatValueY={(v) => v.toFixed(4)}
                size={160}
              />
              <ModUISlider
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <XYPad
                valueX={controls.rate}
                valueY={controls.depth}
                onChangeX={controls.setRate}
                onChangeY={controls.setDepth}
                minX={0.1}
                maxX={10}
                minY={0}
                maxY={2000}
                stepX={0.1}
                stepY={10}
                labelX="Rate"
                labelY="Depth"
                formatValueX={(v) => `${v.toFixed(1)} Hz`}
                formatValueY={(v) => `${v.toFixed(0)} Hz`}
                size={160}
              />
              <ModUISlider
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <XYPad
                valueX={controls.rate}
                valueY={controls.depth}
                onChangeX={controls.setRate}
                onChangeY={controls.setDepth}
                minX={0.1}
                maxX={10}
                minY={0}
                maxY={0.01}
                stepX={0.1}
                stepY={0.0001}
                labelX="Rate"
                labelY="Depth"
                formatValueX={(v) => `${v.toFixed(1)} Hz`}
                formatValueY={(v) => v.toFixed(4)}
                size={160}
              />
              <ModUISlider
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <XYPad
                valueX={controls.rate}
                valueY={controls.depth}
                onChangeX={controls.setRate}
                onChangeY={controls.setDepth}
                minX={0.1}
                maxX={20}
                minY={0}
                maxY={1}
                stepX={0.1}
                stepY={0.01}
                labelX="Rate"
                labelY="Depth"
                formatValueX={(v) => `${v.toFixed(1)} Hz`}
                formatValueY={(v) => v.toFixed(2)}
                size={160}
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
              <ModUISlider
                label="Bit Depth"
                value={controls.bitDepth}
                onChange={controls.setBitDepth}
                min={1}
                max={16}
                step={1}
                formatValue={(v) => v.toFixed(0)}
              />
              <ModUISlider
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
              <ModUISlider
                label="Threshold"
                value={controls.threshold}
                onChange={controls.setThreshold}
                min={-20}
                max={0}
                step={0.1}
                formatValue={(v) => `${v.toFixed(1)} dB`}
              />
              <ModUISlider
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
              <ModUISlider
                label="Threshold"
                value={controls.threshold}
                onChange={controls.setThreshold}
                min={-100}
                max={0}
                step={1}
                formatValue={(v) => `${v.toFixed(0)} dB`}
              />
              <ModUISlider
                label="Attack"
                value={controls.attack}
                onChange={controls.setAttack}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <ModUISlider
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
              <ModUISlider
                label="Sensitivity"
                value={controls.sensitivity}
                onChange={controls.setSensitivity}
                min={0}
                max={5000}
                step={10}
                formatValue={(v) => v.toFixed(0)}
              />
              <ModUISlider
                label="Base Freq"
                value={controls.baseFreq}
                onChange={controls.setBaseFreq}
                min={50}
                max={1000}
                step={10}
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <ModUISlider
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
              <ModUISlider
                label="Frequency"
                value={controls.frequency}
                onChange={controls.setFrequency}
                min={20}
                max={2000}
                step={1}
                formatValue={(v) => `${v.toFixed(0)} Hz`}
              />
              <ModUISlider
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

    case 'VCA':
      return output ? (
        <VCA input={input || { current: null }} output={output} cv={cv}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ModUISlider
                label="Gain"
                value={controls.gain}
                onChange={controls.setGain}
                min={0}
                max={2}
                step={0.01}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>
          )}
        </VCA>
      ) : null;

    case 'LFO':
      return output ? (
        <LFO output={output}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ModUISlider
                label="Frequency"
                value={controls.frequency}
                onChange={controls.setFrequency}
                min={0.1}
                max={20}
                step={0.1}
                formatValue={(v) => `${v.toFixed(2)} Hz`}
              />
              <ModUISlider
                label="Amplitude"
                value={controls.amplitude}
                onChange={controls.setAmplitude}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISelect
                value={controls.waveform}
                onChange={(v) => controls.setWaveform(v as any)}
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
              <ModUISlider
                label="Attack"
                value={controls.attack}
                onChange={controls.setAttack}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <ModUISlider
                label="Decay"
                value={controls.decay}
                onChange={controls.setDecay}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <ModUISlider
                label="Sustain"
                value={controls.sustain}
                onChange={controls.setSustain}
                min={0}
                max={1}
                step={0.01}
                formatValue={(v) => v.toFixed(2)}
              />
              <ModUISlider
                label="Release"
                value={controls.release}
                onChange={controls.setRelease}
                min={0.001}
                max={1}
                step={0.001}
                formatValue={(v) => `${v.toFixed(3)}s`}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <ModUIButton
                  icon={<Zap size={16} />}
                  onClick={controls.trigger}
                  variant="success"
                  title="Trigger"
                />
                <ModUIButton
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
      const gateOutput = outputStreams[1] || null;
      return output ? (
        <Sequencer output={output} gateOutput={gateOutput}>
          {(controls) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ModUISlider
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
                  <ModUISlider
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
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <ModUIButton
                  icon={controls.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  active={controls.isPlaying}
                  onClick={controls.isPlaying ? controls.pause : controls.play}
                  variant="success"
                  title={controls.isPlaying ? 'Pause' : 'Play'}
                />
                <ModUIButton
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Knob
                label="BPM"
                value={controls.bpm}
                onChange={controls.setBpm}
                min={20}
                max={300}
                step={1}
                size={80}
                formatValue={(v) => v.toFixed(0)}
                className="clock-knob"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <ModUIButton
                  icon={controls.isRunning ? <Pause size={16} /> : <Play size={16} />}
                  active={controls.isRunning}
                  onClick={controls.isRunning ? controls.stop : controls.start}
                  variant="success"
                  title={controls.isRunning ? 'Stop' : 'Start'}
                />
                <ModUIButton
                  icon={<RotateCcw size={16} />}
                  onClick={controls.reset}
                  title="Reset"
                />
              </div>
              <style>{`
                .clock-knob .modui-knob-center {
                  color: #1a1a1a;
                }
                .clock-knob .modui-knob-control:hover:not(.modui-knob-disabled) .modui-knob-center {
                  color: #222;
                }
              `}</style>
            </div>
          )}
        </Clock>
      ) : null;

    case 'MP3Deck':
      return output ? (
        <MP3Deck output={output}>
          {(controls) => {
            const formatTime = (seconds: number) => {
              if (!isFinite(seconds)) return '0:00';
              const mins = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return `${mins}:${secs.toString().padStart(2, '0')}`;
            };

            const hasAudio = controls.duration > 0;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ModUIFilePicker
                  onFileSelect={(file) => controls.loadFile(file)}
                  accept="audio/*"
                  label="Load Audio"
                  icon={<Upload size={14} />}
                />
                <ModUISlider
                  label="Gain"
                  value={controls.gain}
                  onChange={controls.setGain}
                  min={0}
                  max={2}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <ModUIButton
                    icon={controls.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    active={controls.isPlaying}
                    onClick={controls.isPlaying ? controls.pause : controls.play}
                    variant="success"
                    title={controls.isPlaying ? 'Pause' : 'Play'}
                    disabled={!hasAudio}
                  />
                  <ModUIButton
                    icon={<Square size={16} />}
                    onClick={controls.stop}
                    title="Stop"
                    disabled={!hasAudio}
                  />
                  <ModUIButton
                    icon={<Repeat size={16} />}
                    active={controls.loop}
                    onClick={() => controls.setLoop(!controls.loop)}
                    title="Loop"
                    disabled={!hasAudio}
                  />
                </div>
                <ModUIProgressBar
                  value={controls.currentTime}
                  onChange={(value) => controls.seek(value)}
                  min={0}
                  max={controls.duration || 100}
                  step={0.1}
                  disabled={!hasAudio}
                  showValue={true}
                  formatValue={() => hasAudio ? `${formatTime(controls.currentTime)} / ${formatTime(controls.duration)}` : '0:00 / 0:00'}
                />
              </div>
            );
          }}
        </MP3Deck>
      ) : null;

    case 'StreamingAudioDeck':
      return output ? (
        <StreamingAudioDeck output={output}>
          {(controls) => {
            const formatTime = (seconds: number) => {
              if (!isFinite(seconds)) return '0:00';
              const mins = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return `${mins}:${secs.toString().padStart(2, '0')}`;
            };

            const hasAudio = controls.duration > 0;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ModUITextInput
                  value={controls.url}
                  onChange={controls.setUrl}
                  placeholder="Stream URL"
                  label="URL"
                  type="url"
                />
                <ModUISlider
                  label="Gain"
                  value={controls.gain}
                  onChange={controls.setGain}
                  min={0}
                  max={2}
                  step={0.01}
                  formatValue={(v) => v.toFixed(2)}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <ModUIButton
                    icon={controls.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    active={controls.isPlaying}
                    onClick={controls.isPlaying ? controls.pause : controls.play}
                    variant="success"
                    title={controls.isPlaying ? 'Pause' : 'Play'}
                    disabled={!hasAudio}
                  />
                  <ModUIButton
                    icon={<Square size={16} />}
                    onClick={controls.stop}
                    title="Stop"
                    disabled={!hasAudio}
                  />
                  <ModUIButton
                    icon={<Repeat size={16} />}
                    active={controls.loop}
                    onClick={() => controls.setLoop(!controls.loop)}
                    title="Loop"
                    disabled={!hasAudio}
                  />
                </div>
                <ModUIProgressBar
                  value={controls.currentTime}
                  onChange={(value) => controls.seek(value)}
                  min={0}
                  max={controls.duration || 100}
                  step={0.1}
                  disabled={!hasAudio}
                  showValue={true}
                  formatValue={() => hasAudio ? `${formatTime(controls.currentTime)} / ${formatTime(controls.duration)}` : '0:00 / 0:00'}
                />
              </div>
            );
          }}
        </StreamingAudioDeck>
      ) : null;

    case 'Oscilloscope':
      return input ? (
        <Oscilloscope input={input}>
          {({ dataArray, bufferLength, isActive }) => (
            isActive ? (
              <OscilloscopeCanvas
                dataArray={dataArray}
                bufferLength={bufferLength}
                height={150}
                color="#00ff88"
                lineWidth={2}
              />
            ) : (
              <div style={{ width: '100%', height: '150px', backgroundColor: '#0a0a0a', borderRadius: '4px', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px' }}>
                No Signal
              </div>
            )
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
            isActive ? (
              <SpectrumAnalyzerCanvas
                dataArray={dataArray}
                bufferLength={bufferLength}
                height={150}
              />
            ) : (
              <div style={{ width: '100%', height: '150px', backgroundColor: '#0a0a0a', borderRadius: '4px', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px' }}>
                No Signal
              </div>
            )
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
            isActive ? (
              <LevelMeterCanvas
                level={level}
                peak={peak}
                isClipping={isClipping}
                height={60}
                orientation="horizontal"
              />
            ) : (
              <div style={{ width: '100%', height: '60px', backgroundColor: '#0a0a0a', borderRadius: '4px', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '12px' }}>
                No Signal
              </div>
            )
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
