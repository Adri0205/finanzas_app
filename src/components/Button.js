import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../theme";

export function Button({
  onPress,
  title,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  style,
}) {
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[500],
    },
    secondary: {
      backgroundColor: theme.colors.secondary[500],
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 2,
      borderColor: theme.colors.primary[500],
    },
    ghost: {
      backgroundColor: "transparent",
    },
    danger: {
      backgroundColor: theme.colors.error,
    },
    success: {
      backgroundColor: theme.colors.success,
    },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      minHeight: 32,
    },
    md: {
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[3],
      minHeight: 44,
    },
    lg: {
      paddingHorizontal: theme.spacing[6],
      paddingVertical: theme.spacing[4],
      minHeight: 52,
    },
  };

  const textColorByVariant = {
    primary: theme.colors.text.inverse,
    secondary: theme.colors.text.inverse,
    outline: theme.colors.primary[500],
    ghost: theme.colors.primary[500],
    danger: theme.colors.text.inverse,
    success: theme.colors.text.inverse,
  };

  // Fallbacks para evitar errores
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const currentSize = sizeStyles[size] || sizeStyles.md;

  const textColor = textColorByVariant[variant] || theme.colors.text.inverse;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        currentVariant,
        currentSize,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {Icon && (
            <View style={styles.iconWrapper}>
              <Icon size={20} color={textColor} />
            </View>
          )}

          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  text: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },

  iconWrapper: {
    marginRight: theme.spacing[2],
  },

  disabled: {
    opacity: 0.5,
  },
});

export default Button;
