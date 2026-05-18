import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

export function Badge({ label, variant = "primary", size = "md", style }) {
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[100],
      color: theme.colors.primary[700],
    },
    secondary: {
      backgroundColor: theme.colors.secondary[100],
      color: theme.colors.secondary[700],
    },
    success: {
      backgroundColor: "#D1FAE5",
      color: "#047857",
    },
    warning: {
      backgroundColor: "#FEF3C7",
      color: "#92400E",
    },
    error: {
      backgroundColor: "#FEE2E2",
      color: "#991B1B",
    },
    accent: {
      backgroundColor: theme.colors.accent[100],
      color: theme.colors.accent[700],
    },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing[2],
      paddingVertical: theme.spacing[1],
      fontSize: theme.typography.sizes.xs,
    },
    md: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[1],
      fontSize: theme.typography.sizes.sm,
    },
    lg: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      fontSize: theme.typography.sizes.base,
    },
  };

  const variant_config = variantStyles[variant] || variantStyles.primary;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variant_config.backgroundColor,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variant_config.color,
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: theme.typography.weights.semibold,
  },
});

export default Badge;
