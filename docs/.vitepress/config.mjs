import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'MOD',
  description: 'Modular Web Audio components for React',
  base: '/mod/',

  head: [
    ['link', { rel: 'icon', href: '/mod/logo.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap', rel: 'stylesheet' }]
  ],

  themeConfig: {
    logo: '/logo.png',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
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
            { text: 'StreamingAudioDeck', link: '/api/sources/streaming-audio-deck' }
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
            { text: 'EQ', link: '/api/processors/eq' }
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
