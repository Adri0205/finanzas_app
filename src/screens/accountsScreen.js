import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import API from "../api/api";

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");

  const loadAccounts = async () => {
    try {
      const response = await API.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const addAccount = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Ingrese un nombre de cuenta válido.");
      return;
    }

    try {
      await API.post("/accounts", { name: name.trim() });
      setName("");
      loadAccounts();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo crear la cuenta",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cuentas</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Nueva cuenta</Text>
        <TextInput
          placeholder="Ej. Efectivo"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={addAccount}>
          <Text style={styles.primaryButtonText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Saldo por cuenta</Text>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No hay cuentas registradas.</Text>
        )}
        renderItem={({ item }) => {
          const balance = Number(item.balance ?? 0);

          return (
            <View style={styles.accountCard}>
              <Text style={styles.accountName}>{item.name}</Text>
              <Text
                style={[
                  styles.accountBalance,
                  balance >= 0 ? styles.income : styles.expense,
                ]}
              >
                ${balance.toFixed(2)}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  primaryButton: {
    backgroundColor: "#2f80ed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  accountCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginBottom: 12,
  },
  accountName: {
    fontWeight: "600",
  },
  accountBalance: {
    fontWeight: "700",
  },
  income: {
    color: "#219653",
  },
  expense: {
    color: "#eb5757",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});
