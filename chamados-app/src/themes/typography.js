import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const typography = {
  fontFamily,

  display: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    fontFamily,
    letterSpacing: -0.8,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    fontFamily,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    fontFamily,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily,
    letterSpacing: 0,
  },
  small: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily,
    letterSpacing: 0.1,
  },
  smallMedium: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily,
    letterSpacing: 0.2,
  },
  captionMedium: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily,
    letterSpacing: 0.1,
  },
};
