/**
 * Al-Arafa Restaurant - Theme Configuration
 * Matches mobile app design system
 */

export const colors = {
  // Brand Colors
  primary: '#9f0008', // Al-Arafa Restaurant brand red
  primaryDark: '#A40301',
  primaryLight: '#c4000a',
  secondary: '#FFC016', // Gold accent
  secondaryLight: '#FFD666',

  // Background Colors
  background: '#FFFFFF',
  backgroundGray: '#F5F7FA',
  backgroundDark: '#242424',
  white: '#FFFFFF',

  // Text Colors
  text: {
    primary: '#242424',
    secondary: '#4a5568',
    tertiary: '#718096',
    light: '#a0aec0',
    white: '#FFFFFF',
  },

  // Semantic Colors
  success: '#48bb78',
  successLight: '#9ae6b4',
  error: '#f56565',
  errorLight: '#fc8181',
  warning: '#ed8936',
  warningLight: '#fbd38d',
  info: '#4299e1',
  infoLight: '#90cdf4',

  // Border Colors
  border: {
    light: '#e2e8f0',
    medium: '#cbd5e0',
    dark: '#a0aec0',
  },

  // Status Colors (for orders)
  status: {
    pending: '#ed8936', // Orange
    confirmed: '#4299e1', // Blue
    preparing: '#805ad5', // Purple
    ready: '#38b2ac', // Teal
    outForDelivery: '#3182ce', // Blue
    delivered: '#48bb78', // Green
    completed: '#48bb78', // Green
    cancelled: '#f56565', // Red
  },

  // Order Type Colors
  orderType: {
    instant: '#48bb78', // Green badge
    catering: '#9f0008', // Red/Gold badge
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Input
  input: {
    background: '#FFFFFF',
    border: '#e2e8f0',
    borderFocused: '#9f0008',
    placeholder: '#a0aec0',
    disabled: '#f7fafc',
  },

  // Card
  card: {
    background: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
} as const;

export const typography = {
  // Font Sizes (in pixels, Tailwind will convert)
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.8',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.5px',
    normal: '0',
    wide: '0.5px',
    wider: '1px',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const;

export type Theme = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  breakpoints: typeof breakpoints;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
};
