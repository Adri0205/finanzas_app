// Typography system for finanzas-app
export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    "2xl": 20,
    "3xl": 24,
    "4xl": 28,
    "5xl": 32,
    "6xl": 36,
    "7xl": 40,
  },

  weights: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const textStyles = {
  // Display
  display: {
    fontSize: typography.sizes["5xl"],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
  },

  // Headings
  h1: {
    fontSize: typography.sizes["4xl"],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
  },

  h2: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.tight,
  },

  h3: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
  },

  h4: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
  },

  // Body
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.relaxed,
  },

  bodyBold: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.relaxed,
  },

  bodySmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.normal,
  },

  bodySmallBold: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.lineHeights.normal,
  },

  // Label
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.lineHeights.normal,
  },

  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.normal,
    lineHeight: typography.lineHeights.tight,
  },
};

export default typography;
