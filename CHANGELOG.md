# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.11] - 2026-02-03

### Added
- **Sampler** component - Advanced sample playback with gate/pitch CV, multiple playback modes (one-shot, gate, loop), and start/end time controls
- **Transport system** - DAW-style timing with Transport, TransportBus, TransportWorklet, Scheduler, and PhaseSequencer components
- **Named CV input ports** - All modules now have labeled CV inputs (cv-freq, cv-gate, cv-clock, cv-reset, cv-pitch, etc.) for clearer signal routing
- **Centralized parameter management** in demo app - Module parameters now stored in parent state for better control flow
- **Enhanced ModuleRenderer** - Improved UI consistency across all module types with better parameter controls
- Sampler documentation and comprehensive unit tests
- Transport system documentation

### Changed
- Demo app now uses centralized state management for module parameters
- All module definitions include inputLabels, inputIds, and outputLabels for better UX
- ModuleRenderer refactored with consistent parameter handling across all module types
- Improved sidebar organization with Sampler and DiodeFilter buttons

### Contributors
- Zack Hagan (@zhagan) - Demo app improvements, ModuleRenderer enhancements, named CV port system

## [0.1.10] - 2026-01-31

### Added
- **DiodeFilter** component - AudioWorklet-based nonlinear ladder filter with cutoff, resonance, drive, and CV modulation
- **Slider log scale** - New `scale="log"` prop for logarithmic slider behavior (ideal for frequency controls)
- **Clock startOutput** - Optional second output providing transport running state (1 when running, 0 when stopped)
- DiodeFilter documentation and 20 unit tests
- AudioWorklet mocking in test setup for worklet-based components

### Changed
- Clock now uses AudioWorklet for sample-accurate timing (previously used setInterval)
- Clock pulses at 16th note intervals for better sequencer integration
- Slider documentation updated with simpler log scale example

### Contributors
- Zack Hagan (@zhagan) - Clock worklet, DiodeFilter, Slider log scale

## [0.1.8] - 2025-01-22

### Added
- `useModStreamToMediaStream` hook for converting ModStreams to MediaStream API
- `isReady` state to MP3Deck for reliable audio loading detection
- Documentation for `useModStream` and `useModStreamToMediaStream` hooks
- Hooks section in API documentation

### Changed
- MP3Deck now uses stable gain node architecture for reliable queue playback
- Microphone now uses stable gain node to prevent disconnection on device changes
- CrossFade improved input tracking using key-based dependencies
- useModStream now triggers reactive updates on connection state changes
- Updated MP3Deck documentation with `isReady` usage patterns
- Improved CORS handling in MP3Deck (only applies to remote URLs, not blob URLs)

### Fixed
- MP3Deck queue playback issues (tracks not advancing, audio dropout)
- Blob URL revocation timing causing "WebKitBlobResource error 1"
- MP3Deck play button not disabling when audio not ready
- Monitor connection stability when switching tracks
- Performance stuttering on MP3Deck pause/resume
- Missing `onEnd` callback documentation in MP3Deck

## [0.1.7] - 2025-01-22

### Added
- VCA (Voltage Controlled Amplifier) component for amplitude modulation
- Sequencer gate output for triggering envelopes
- Comprehensive documentation for all components
- LLM guide for AI-assisted development
- ModUI component library (Slider, Knob, XYPad, Button, Select, etc.)
- Visualization components (Oscilloscope, SpectrumAnalyzer, LevelMeter)
- Complete processor suite (Filter, Delay, Reverb, Compressor, Distortion, etc.)
- CV generators (LFO, ADSR, Sequencer, Clock)
- Audio sources (ToneGenerator, NoiseGenerator, Microphone, MP3Deck, StreamingAudioDeck)
- Mixer components (Mixer, CrossFade)
- Interactive playground for testing and experimentation

### Changed
- Improved Sequencer gate pulse duration (now 80% of step duration)
- Fixed VCA CV input routing in playground
- Updated ModUI documentation to reflect current exports

### Fixed
- TypeScript errors in test files
- Missing types file in demo package
- Unused variables in ModuleRenderer
- Invalid SliderProps in Sequencer component

## [0.1.0] - Initial Release

### Added
- Core audio processing library
- React component architecture
- Web Audio API integration
- Modular signal routing system
- Basic documentation

[Unreleased]: https://github.com/Mode7Labs/mod/compare/v0.1.11...HEAD
[0.1.11]: https://github.com/Mode7Labs/mod/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/Mode7Labs/mod/compare/v0.1.8...v0.1.10
[0.1.8]: https://github.com/Mode7Labs/mod/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/Mode7Labs/mod/compare/v0.1.0...v0.1.7
[0.1.0]: https://github.com/Mode7Labs/mod/releases/tag/v0.1.0
