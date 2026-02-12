import { useWindowDimensions } from 'react-native';

const BREAKPOINTS = {
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.sm;
  const isTablet = width >= BREAKPOINTS.sm && width < BREAKPOINTS.md;
  const isDesktop = width >= BREAKPOINTS.md;
  const isLargeDesktop = width >= BREAKPOINTS.lg;

  // Responsive value helper: pick value based on breakpoint
  // Usage: responsiveValue({ mobile: 1, tablet: 2, desktop: 3 })
  function responsiveValue({ mobile, tablet, desktop }) {
    if (isDesktop) return desktop ?? tablet ?? mobile;
    if (isTablet) return tablet ?? mobile;
    return mobile;
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    screenWidth: width,
    screenHeight: height,
    breakpoints: BREAKPOINTS,
    responsiveValue,
  };
}
