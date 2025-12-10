import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MOD',
  description: 'Modular Web Audio components for React',
  base: '/mod/',
  srcExclude: ['**/CLAUDE.md'],

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap', rel: 'stylesheet' }]
  ],

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'UI', link: '/api/ui/overview' },
      { text: 'Playground', link: '/playground/index.html', target: '_self' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is mod?', link: '/guide/what-is-mod' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Audio Context', link: '/guide/audio-context' },
            { text: 'Connecting Modules', link: '/guide/connecting-modules' },
            { text: 'CV Modulation', link: '/guide/cv-modulation' }
          ]
        },
        {
          text: 'Module Types',
          items: [
            { text: 'Sources', link: '/guide/sources' },
            { text: 'CV Generators', link: '/guide/cv-generators' },
            { text: 'Processors', link: '/guide/processors' },
            { text: 'Mixers', link: '/guide/mixers' },
            { text: 'Output', link: '/guide/output' }
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Simple Synthesizer', link: '/guide/examples/simple-synth' },
            { text: 'Simple Sampler', link: '/guide/examples/simple-sampler' },
            { text: 'LFO Modulation', link: '/guide/examples/lfo-modulation' },
            { text: 'Rhythmic Patterns', link: '/guide/examples/rhythmic-patterns' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'AudioProvider', link: '/api/audio-provider' }
          ]
        },
        {
          text: 'Sources',
          items: [
            { text: 'ToneGenerator', link: '/api/sources/tone-generator' },
            { text: 'NoiseGenerator', link: '/api/sources/noise-generator' },
            { text: 'Microphone', link: '/api/sources/microphone' },
            { text: 'MP3Deck', link: '/api/sources/mp3-deck' },
            { text: 'StreamingAudioDeck', link: '/api/sources/streaming-audio-deck' },
            { text: 'Sampler', link: '/api/sources/sampler' }
          ]
        },
        {
          text: 'CV Generators',
          items: [
            { text: 'LFO', link: '/api/cv/lfo' },
            { text: 'ADSR', link: '/api/cv/adsr' },
            { text: 'Sequencer', link: '/api/cv/sequencer' },
            { text: 'Clock', link: '/api/cv/clock' }
          ]
        },
        {
          text: 'Processors',
          items: [
            { text: 'Filter', link: '/api/processors/filter' },
            { text: 'Delay', link: '/api/processors/delay' },
            { text: 'Reverb', link: '/api/processors/reverb' },
            { text: 'Compressor', link: '/api/processors/compressor' },
            { text: 'Distortion', link: '/api/processors/distortion' },
            { text: 'Panner', link: '/api/processors/panner' },
            { text: 'EQ', link: '/api/processors/eq' },
            { text: 'Chorus', link: '/api/processors/chorus' },
            { text: 'Phaser', link: '/api/processors/phaser' },
            { text: 'Flanger', link: '/api/processors/flanger' },
            { text: 'Tremolo', link: '/api/processors/tremolo' },
            { text: 'BitCrusher', link: '/api/processors/bitcrusher' },
            { text: 'Limiter', link: '/api/processors/limiter' },
            { text: 'Gate', link: '/api/processors/gate' },
            { text: 'AutoWah', link: '/api/processors/autowah' },
            { text: 'RingModulator', link: '/api/processors/ringmodulator' },
            { text: 'VCA', link: '/api/processors/vca' }
          ]
        },
        {
          text: 'Mixers',
          items: [
            { text: 'Mixer', link: '/api/mixers/mixer' },
            { text: 'CrossFade', link: '/api/mixers/crossfade' }
          ]
        },
        {
          text: 'Output',
          items: [
            { text: 'Monitor', link: '/api/output/monitor' }
          ]
        },
        {
          text: 'Visualizations',
          items: [
            { text: 'Oscilloscope', link: '/api/visualizations/oscilloscope' },
            { text: 'SpectrumAnalyzer', link: '/api/visualizations/spectrum-analyzer' },
            { text: 'LevelMeter', link: '/api/visualizations/level-meter' }
          ]
        },
        {
          text: 'Hooks',
          items: [
            { text: 'useModStream', link: '/api/hooks/use-mod-stream' },
            { text: 'useModStreamToMediaStream', link: '/api/hooks/use-mod-stream-to-media-stream' }
          ]
        },
        {
          text: 'UI Components',
          items: [
            { text: 'Overview', link: '/api/ui/overview' }
          ]
        },
        {
          text: 'UI - Controls',
          items: [
            { text: 'Slider', link: '/api/ui/controls/slider' },
            { text: 'Knob', link: '/api/ui/controls/knob' },
            { text: 'XY Pad', link: '/api/ui/controls/xypad' },
            { text: 'Button', link: '/api/ui/controls/button' },
            { text: 'Select', link: '/api/ui/controls/select' },
            { text: 'FilePicker', link: '/api/ui/controls/filepicker' },
            { text: 'TextInput', link: '/api/ui/controls/textinput' },
            { text: 'ProgressBar', link: '/api/ui/controls/progressbar' }
          ]
        }
      ],
      '/api/ui/': [
        {
          text: 'UI Components',
          items: [
            { text: 'Overview', link: '/api/ui/overview' }
          ]
        },
        {
          text: 'Controls',
          items: [
            { text: 'Slider', link: '/api/ui/controls/slider' },
            { text: 'Knob', link: '/api/ui/controls/knob' },
            { text: 'XY Pad', link: '/api/ui/controls/xypad' },
            { text: 'Button', link: '/api/ui/controls/button' },
            { text: 'Select', link: '/api/ui/controls/select' },
            { text: 'FilePicker', link: '/api/ui/controls/filepicker' },
            { text: 'TextInput', link: '/api/ui/controls/textinput' },
            { text: 'ProgressBar', link: '/api/ui/controls/progressbar' }
          ]
        },
        {
          text: 'Visualizations',
          items: [
            { text: 'OscilloscopeCanvas', link: '/api/ui/visualizations/oscilloscope' },
            { text: 'SpectrumAnalyzerCanvas', link: '/api/ui/visualizations/spectrum-analyzer' },
            { text: 'LevelMeterCanvas', link: '/api/ui/visualizations/level-meter' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Mode7Labs/mod' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Made with ❤️ for the Web Audio community'
    }
  }
})
