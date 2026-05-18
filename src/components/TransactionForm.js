import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Input, SelectInput } from ".";
import { theme } from "../theme";

const typeOptions = [
  { value: "ingreso", label: "Ingreso" },
  { value: "gasto", label: "Gasto" },
];

const expenseCategories = [
  { value: "Alimentación", label: "Alimentación" },
  { value: "Transporte", label: "Transporte" },
  { value: "Vivienda", label: "Vivienda" },
  { value: "Servicios básicos", label: "Servicios básicos" },
  { value: "Salud", label: "Salud" },
  { value: "Educación", label: "Educación" },
  { value: "Entretenimiento", label: "Entretenimiento" },
  { value: "Compras personales", label: "Compras personales" },
  { value: "Tecnología", label: "Tecnología" },
  { value: "Mascotas", label: "Mascotas" },
  { value: "Ahorro e inversión", label: "Ahorro e inversión" },
  { value: "Deudas y préstamos", label: "Deudas y préstamos" },
  { value: "Impuestos", label: "Impuestos" },
  { value: "Regalos y donaciones", label: "Regalos y donaciones" },
  { value: "Viajes", label: "Viajes" },
  { value: "Ejercicio y deporte", label: "Ejercicio y deporte" },
  { value: "Suscripciones", label: "Suscripciones" },
  { value: "Emergencias", label: "Emergencias" },
  { value: "Otros", label: "Otros" },
];

const incomeCategories = [
  { value: "Salario", label: "Salario" },
  { value: "Freelance", label: "Freelance" },
  { value: "Inversiones", label: "Inversiones" },
  { value: "Negocios", label: "Negocios" },
  { value: "Regalos", label: "Regalos" },
  { value: "Bonificaciones", label: "Bonificaciones" },
  { value: "Otros", label: "Otros" },
];

const paymentMethodOptions = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Débito", label: "Débito" },
  { value: "Crédito", label: "Crédito" },
  { value: "Transferencia", label: "Transferencia" },
  { value: "Billetera digital", label: "Billetera digital" },
];

export default function TransactionForm({
  initialValues = {},
  onSubmit,
  submitLabel,
}) {
  const [amount, setAmount] = useState(String(initialValues.amount || ""));

  const [type, setType] = useState(initialValues.type || "ingreso");

  const [category, setCategory] = useState(initialValues.category || "");

  const [paymentMethod, setPaymentMethod] = useState(
    initialValues.payment_method || "",
  );

  const [description, setDescription] = useState(
    initialValues.description || "",
  );

  const [transactionDate, setTransactionDate] = useState(() => {
    if (initialValues.transaction_date) return initialValues.transaction_date;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  const [customCategory, setCustomCategory] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const categoryOptions =
    type === "gasto" ? expenseCategories : incomeCategories;

  useEffect(() => {
    setAmount(String(initialValues.amount || ""));
    setType(initialValues.type || "ingreso");
    setCategory(initialValues.category || "");
    setPaymentMethod(initialValues.payment_method || "");
    setDescription(initialValues.description || "");

    const localToday = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    };
    setTransactionDate(initialValues.transaction_date || localToday());

    setCustomCategory("");
  }, [initialValues]);

  const handleCategoryChange = (value) => {
    setCategory(value);

    if (value !== "Otros") {
      setCustomCategory("");
    }
  };

  const finalCategory = category === "Otros" ? customCategory : category;

  const handleSubmit = () => {
    if (!amount || !type || !finalCategory || !transactionDate) {
      Alert.alert("Error", "Complete todos los campos obligatorios.");

      return;
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Ingrese un monto válido mayor que cero.");

      return;
    }

    if (category === "Otros" && !customCategory.trim()) {
      Alert.alert("Error", "Ingrese una categoría personalizada.");

      return;
    }

    onSubmit({
      amount: parsedAmount,
      type,
      category_name: finalCategory.trim(),
      payment_method: paymentMethod,
      description: description.trim(),
      transaction_date: transactionDate.trim(),
    });
  };

  return (
    <View style={styles.form}>
      <Input
        placeholder="Monto (Ej. 1200)"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
        maxLength={12}
      />

      <View style={styles.typeRow}>
        {typeOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => {
              setType(option.value);
              setCategory("");
            }}
            style={[
              styles.typeButton,
              type === option.value && styles.typeButtonActive,
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === option.value && styles.typeButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SelectInput
        label={type === "gasto" ? "Categoría de gasto" : "Categoría de ingreso"}
        placeholder="Seleccionar categoría"
        value={category}
        onValueChange={handleCategoryChange}
        options={categoryOptions}
        searchable
      />

      {category === "Otros" && (
        <Input
          placeholder="Ingrese categoría personalizada"
          value={customCategory}
          onChangeText={setCustomCategory}
        />
      )}

      <SelectInput
        label="Método de pago"
        placeholder="Seleccionar método de pago"
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        options={paymentMethodOptions}
      />

      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Fecha</Text>

        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{transactionDate}</Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={(() => {
              const [y, m, d] = transactionDate.split("-").map(Number);
              return new Date(y, m - 1, d);
            })()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);

              if (selectedDate) {
                const y = selectedDate.getFullYear();
                const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
                const d = String(selectedDate.getDate()).padStart(2, "0");
                setTransactionDate(`${y}-${m}-${d}`);
              }
            }}
          />
        )}
      </View>

      <Input
        placeholder="Descripción (Opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        inputStyle={styles.textArea}
      />

      <Button title={submitLabel} onPress={handleSubmit} size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: "100%",
    paddingBottom: theme.spacing[4],
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  typeRow: {
    flexDirection: "row",
    marginBottom: theme.spacing[4],
    gap: theme.spacing[2],
  },

  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    minHeight: 44,
  },

  typeButtonActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },

  typeButtonText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.secondary,
  },

  typeButtonTextActive: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.weights.semibold,
  },

  dateContainer: {
    marginBottom: theme.spacing[3],
  },

  dateLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },

  dateButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surface,
    minHeight: 50,
    justifyContent: "center",
  },

  dateText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
  },
});
