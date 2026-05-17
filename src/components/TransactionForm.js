import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import API from "../api/api";


const typeOptions = [
  { value: "ingreso", label: "Ingreso" },
  { value: "gasto", label: "Gasto" },
];


export default function TransactionForm({
  initialValues,
  onSubmit,
  submitLabel,
}) {
  const [amount, setAmount] = useState(String(initialValues.amount || ""));
  const [type, setType] = useState(initialValues.type || "ingreso");
  const [category, setCategory] = useState(initialValues.category || "");
  const [account, setAccount] = useState(initialValues.account || "");
  const [description, setDescription] = useState(
    initialValues.description || "",
  );
  const [transactionDate, setTransactionDate] = useState(
    initialValues.transaction_date || new Date().toISOString().slice(0, 10),
  );
  const [accounts, setAccounts] = useState([]);


  useEffect(() => {
    setAmount(String(initialValues.amount || ""));
    setType(initialValues.type || "ingreso");
    setCategory(initialValues.category || "");
    setAccount(initialValues.account || "");
    setDescription(initialValues.description || "");
    setTransactionDate(
      initialValues.transaction_date || new Date().toISOString().slice(0, 10),
    );
  }, [initialValues]);


  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await API.get("/accounts");
        setAccounts(response.data);
      } catch (error) {
        console.log(error.response?.data || error.message);
      }
    };


    loadAccounts();
  }, []);


  const handleSubmit = () => {
    if (
      !amount ||
      !type ||
      !category.trim() ||
      !account.trim() ||
      !transactionDate.trim()
    ) {
      Alert.alert("Error", "Complete todos los campos obligatorios.");
      return;
    }


    const parsedAmount = Number(amount);


    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Ingrese un monto válido mayor que cero.");
      return;
    }


    onSubmit({
      amount: parsedAmount,
      type,
      category_name: category.trim(),
      account_name: account.trim(),
      description: description.trim(),
      transaction_date: transactionDate.trim(),
    });
  };


  return (
    <View style={styles.form}>
      <Text style={styles.label}>Monto</Text>
      <TextInput
        placeholder="Ej. 1200"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />


      <Text style={styles.label}>Tipo</Text>
      <View style={styles.typeRow}>
        {typeOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setType(option.value)}
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


      <Text style={styles.label}>Categoría</Text>
      <TextInput
        placeholder="Ej. Comida"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />


      <Text style={styles.label}>Cuenta</Text>
      <TextInput
        placeholder="Ej. Tarjeta"
        value={account}
        onChangeText={setAccount}
        style={styles.input}
      />
      {accounts.length > 0 ? (
        <View style={styles.suggestionsWrapper}>
          <Text style={styles.suggestionsTitle}>Cuentas existentes</Text>
          <FlatList
            data={accounts}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionButton}
                onPress={() => setAccount(item.name)}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : null}


      <Text style={styles.label}>Fecha</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={transactionDate}
        onChangeText={setTransactionDate}
        style={styles.input}
      />


      <Text style={styles.label}>Descripción</Text>
      <TextInput
        placeholder="Opcional"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
      />


      <Button title={submitLabel} onPress={handleSubmit} />
    </View>
  );
}


const styles = StyleSheet.create({
  form: {
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  typeButtonActive: {
    backgroundColor: "#2f80ed",
    borderColor: "#2f80ed",
  },
  typeButtonText: {
    color: "#333",
  },
  typeButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  suggestionsWrapper: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    marginBottom: 8,
    fontWeight: "600",
  },
  suggestionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    backgroundColor: "#f1f1f1",
  },
  suggestionText: {
    color: "#333",
  },
});
