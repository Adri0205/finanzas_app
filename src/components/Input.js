import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../theme";

export function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "none",
  editable = true,
  label,
  error,
  icon: Icon,
  style,
  inputStyle,
  ...props
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {Icon && (
          <Icon
            size={20}
            color={error ? theme.colors.error : theme.colors.neutral[400]}
            style={styles.icon}
          />
        )}

        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral[400]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          style={[styles.input, Icon && styles.inputWithIcon, inputStyle]}
          {...props}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[3],
  },

  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[3],
    minHeight: 44,
  },

  input: {
    flex: 1,
    height: 44,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
  },

  inputWithIcon: {
    marginLeft: theme.spacing[2],
  },

  icon: {
    marginRight: theme.spacing[1],
  },

  inputError: {
    borderColor: theme.colors.error,
  },

  errorText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    marginTop: theme.spacing[1],
    fontWeight: theme.typography.weights.medium,
  },
});

export default Input;
