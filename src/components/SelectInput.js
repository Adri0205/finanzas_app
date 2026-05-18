import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../theme";

export function SelectInput({
  label,
  placeholder,
  value,
  onValueChange,
  options = [],
  error,
  style,
  searchable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const handleSelect = (optionValue) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setIsOpen(true)}
        accessible={true}
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityHint={selectedOption?.label || placeholder}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>

        <MaterialCommunityIcons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={error ? theme.colors.error : theme.colors.neutral[400]}
        />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
            <Pressable style={styles.modalContent} onPress={() => {}}>
              {searchable && (
                <View style={styles.searchContainer}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={theme.colors.neutral[400]}
                    style={styles.searchIcon}
                  />

                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Buscar..."
                    placeholderTextColor={theme.colors.neutral[400]}
                  />
                </View>
              )}

              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item.value.toString()}
                scrollEnabled={filteredOptions.length > 6}
                nestedScrollEnabled={true}
                style={styles.optionsList}
                contentContainerStyle={styles.optionsListContent}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.option,
                      value === item.value && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(item.value)}
                    accessible={true}
                    accessibilityRole="menuitem"
                    accessibilityLabel={item.label}
                    accessibilityState={{
                      selected: value === item.value,
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.optionText,
                          value === item.value && styles.optionTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>

                      {value === item.value && (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={theme.colors.primary[500]}
                        />
                      )}
                    </View>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay opciones</Text>
                  </View>
                }
              />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
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

  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    minHeight: 44,
  },

  triggerError: {
    borderColor: theme.colors.error,
  },

  triggerText: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    marginRight: theme.spacing[2],
  },

  triggerPlaceholder: {
    color: theme.colors.neutral[400],
  },

  errorText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    marginTop: theme.spacing[1],
    fontWeight: theme.typography.weights.medium,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    height: "85%",
    paddingTop: theme.spacing[4],
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },

  searchIcon: {
    marginRight: theme.spacing[2],
  },

  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    height: 40,
  },

  optionsList: {
    flexGrow: 0,
  },

  optionsListContent: {
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },

  option: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[2],
    backgroundColor: theme.colors.background,
  },

  optionSelected: {
    backgroundColor: theme.colors.primary[50],
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary[500],
  },

  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  optionText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    flex: 1,
  },

  optionTextSelected: {
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary[500],
  },

  emptyContainer: {
    paddingVertical: theme.spacing[4],
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.sm,
  },
});

export default SelectInput;
