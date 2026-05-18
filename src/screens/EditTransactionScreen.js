import { useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import API from "../api/api";
import { Container } from "../components";
import TransactionForm from "../components/TransactionForm";

export default function EditTransactionScreen({ route, navigation }) {
  const transaction = route.params?.transaction;

  useEffect(() => {
    if (!transaction) {
      navigation.goBack();
    }
  }, [navigation, transaction]);

  if (!transaction) return null;

  const actualizarTransaccion = async (transactionData) => {
    try {
      await API.put(`/transactions/${transaction.id}`, transactionData);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo actualizar la transacción",
      );
    }
  };

  return (
    <Container padding={0}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
      >
        <TransactionForm
          initialValues={{
            amount: String(transaction.amount || ""),
            type: transaction.type || "ingreso",
            category: transaction.category_name || "",
            payment_method: transaction.payment_method || "",
            account: transaction.account_name || "",
            description: transaction.description || "",
            transaction_date: transaction.transaction_date
              ? transaction.transaction_date.slice(0, 10)
              : new Date().toISOString().slice(0, 10),
          }}
          onSubmit={actualizarTransaccion}
          submitLabel="Actualizar transacción"
        />
      </ScrollView>
    </Container>
  );
}
