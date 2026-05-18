import { StyleSheet, TouchableOpacity, View } from "react-native";
import { theme } from "../theme";

export function Card({
  children,
  onPress,
  style,
  variant = "default",
  padding = 4,
}) {
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    elevated: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.md,
    },
    outlined: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    subtle: {
      backgroundColor: theme.colors.neutral[50],
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  };

  const content = (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        { padding: theme.spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.md,
  },
});

export default Card;
