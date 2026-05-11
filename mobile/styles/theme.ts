/**
 * Design System Tokens — React Native
 * Mirrors the frontend CSS design system (index.css).
 * Use these constants instead of hardcoded values throughout the app.
 */

// ─── Colors ───────────────────────────────────────────────────────────────────

export const colors = {
  // Surface
  surface: "#f8f9ff",
  surfaceDim: "#cbdbf5",
  surfaceBright: "#f8f9ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#eff4ff",
  surfaceContainer: "#e5eeff",
  surfaceContainerHigh: "#dce9ff",
  surfaceContainerHighest: "#d3e4fe",
  onSurface: "#0b1c30",
  surfaceVariant: "#dce9ff",
  onSurfaceVariant: "#44474e",
  inverseSurface: "#213145",
  inverseOnSurface: "#eaf1ff",
  outline: "#75777f",
  outlineVariant: "#c5c6cf",
  surfaceTint: "#4e5e82",

  // Primary
  primary: "#031636",
  onPrimary: "#ffffff",
  primaryContainer: "#1a2b4c",
  onPrimaryContainer: "#8293ba",
  inversePrimary: "#b6c6f0",

  // Secondary
  secondary: "#264dd9",
  onSecondary: "#ffffff",
  secondaryContainer: "#4568f3",
  onSecondaryContainer: "#fffbff",

  // Tertiary
  tertiary: "#141819",
  onTertiary: "#ffffff",
  tertiaryContainer: "#292c2e",
  onTertiaryContainer: "#909395",

  // Error
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",

  // Fixed
  primaryFixed: "#d8e2ff",
  primaryFixedDim: "#b6c6f0",
  secondaryFixed: "#dde1ff",
  secondaryFixedDim: "#b8c3ff",

  // Background
  background: "#f8f9ff",
  onBackground: "#0b1c30",

  // Convenience
  white: "#ffffff",
  transparent: "transparent",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontFamily = {
  base: "Manrope",
  fallback: "System",
} as const;

export const fontWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  extraBold: "800",
} as const;

export const typography = {
  displayXl: {
    fontFamily: fontFamily.base,
    fontSize: 48,
    fontWeight: fontWeight.extraBold,
    lineHeight: 53, // 1.1 × 48
    letterSpacing: -0.96, // -0.02em × 48
  },
  headlineLg: {
    fontFamily: fontFamily.base,
    fontSize: 32,
    fontWeight: fontWeight.bold,
    lineHeight: 38, // 1.2 × 32
    letterSpacing: -0.32, // -0.01em × 32
  },
  headlineMd: {
    fontFamily: fontFamily.base,
    fontSize: 24,
    fontWeight: fontWeight.semiBold,
    lineHeight: 31, // 1.3 × 24
  },
  bodyLg: {
    fontFamily: fontFamily.base,
    fontSize: 18,
    fontWeight: fontWeight.regular,
    lineHeight: 29, // 1.6 × 18
  },
  bodyMd: {
    fontFamily: fontFamily.base,
    fontSize: 16,
    fontWeight: fontWeight.regular,
    lineHeight: 26, // 1.6 × 16
  },
  labelBold: {
    fontFamily: fontFamily.base,
    fontSize: 14,
    fontWeight: fontWeight.bold,
    lineHeight: 20, // 1.4 × 14
  },
  labelSm: {
    fontFamily: fontFamily.base,
    fontSize: 12,
    fontWeight: fontWeight.medium,
    lineHeight: 17, // 1.4 × 12
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  unit: 8,
  stackSm: 8,
  stackMd: 24,
  stackLg: 48,
  sectionGap: 80,
  gutter: 32,
  marginEdge: 64,
  // Shorthand scale
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  sm: 2,   // 0.125rem
  base: 4, // 0.25rem
  md: 6,   // 0.375rem
  lg: 8,   // 0.5rem
  xl: 12,  // 0.75rem
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

// React Native shadows require separate iOS and Android properties.
export const shadows = {
  sm: {
    shadowColor: "#1a2b4c",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#1a2b4c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: "#1a2b4c",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  xl: {
    shadowColor: "#1a2b4c",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
} as const;

// ─── Transitions / Animation Durations ───────────────────────────────────────

export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

// ─── Layout ───────────────────────────────────────────────────────────────────

export const layout = {
  containerMaxWidth: 1440,
  navbarHeight: 56,
} as const;

// ─── Composed Theme Object ────────────────────────────────────────────────────

const theme = {
  colors,
  fontFamily,
  fontWeight,
  typography,
  spacing,
  radius,
  shadows,
  duration,
  layout,
} as const;

export default theme;
