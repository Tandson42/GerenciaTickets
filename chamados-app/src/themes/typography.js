import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const typography = {
  fontFamily,

  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    fontFamily,
  },
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    fontFamily,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    fontFamily,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily,
  },
  smallMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily,
  },
  captionMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily,
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily,
  },
};
