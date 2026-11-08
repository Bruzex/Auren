export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#07070A',
        surface: {
          DEFAULT: '#101014',
          raised: '#16161C',
        },
        accent: {
          DEFAULT: '#5A82FF',
          strong: '#4A72F5',
          soft: '#93ADFF',
        },
        iris: {
          DEFAULT: '#A88BFF',
          soft: '#C9B8FF',
        },
        online: '#32D583',
        danger: '#FF7A88',
        label: {
          DEFAULT: 'rgba(255,255,255,0.94)',
          secondary: 'rgba(235,235,245,0.62)',
          tertiary: 'rgba(235,235,245,0.38)',
          quaternary: 'rgba(235,235,245,0.18)',
        },
        hairline: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
};
