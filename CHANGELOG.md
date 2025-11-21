# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/Mode7Labs/mod/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Mode7Labs/mod/releases/tag/v0.1.0
