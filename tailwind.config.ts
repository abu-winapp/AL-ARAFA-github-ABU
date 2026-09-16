import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand colors (unified restaurant palette)
        primary: {
          DEFAULT: '#7A231D',
          dark: '#5C1B16',
          light: '#92342C',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: '#C9A24B',
          dark: '#A9812F',
          light: '#EFDFB8',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        brand: {
          maroon: '#7A231D',
          'maroon-dark': '#5C1B16',
          gold: '#C9A24B',
          'gold-dark': '#A9812F',
          'gold-tint': '#EFDFB8',
          cream: '#F7F1E6',
          'cream-soft': '#FFFBF3',
          ink: '#221A16',
          muted: '#6B6058',
          border: '#E7DCC9',
          forest: '#241B16',
        },
        background: {
          DEFAULT: '#ffffff',
          gray: '#F5F7FA',
          dark: '#242424',
        },
        foreground: '#242424',
        text: {
          primary: '#242424',
          secondary: '#4a5568',
          tertiary: '#718096',
          light: '#a0aec0',
        },
        status: {
          pending: '#ed8936',
          confirmed: '#4299e1',
          preparing: '#805ad5',
          ready: '#38b2ac',
          'out-for-delivery': '#3182ce',
          delivered: '#48bb78',
          cancelled: '#f56565',
        },
        // shadcn/ui colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: 'var(--radius)',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
