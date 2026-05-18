import { Alert, ScrollView } from "react-native";
import API from "../api/api";
import { Container } from "../components";
import TransactionForm from "../components/TransactionForm";

export default function AddTransactionScreen({ navigation }) {
  const guardarTransaccion = async (transaction) => {
    try {
      console.log("llamando a api");
      await API.post("/transactions", transaction);
      navigation.navigate("Transactions");
    } catch (error) {
      console.log("error en api", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "No se pudo guardar la transacción",
      );
    }
  };

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <TransactionForm
          initialValues={{
            amount: "",
            type: "ingreso",
            category: "",
            payment_method: "",
            description: "",
            transaction_date: new Date().toISOString().slice(0, 10),
          }}
          onSubmit={guardarTransaccion}
          submitLabel="Guardar transacción"
        />
      </ScrollView>
    </Container>
  );
}
