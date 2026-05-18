import { ScrollView } from "react-native";
import API from "../api/api";
import { Container } from "../components";
import TransactionForm from "../components/TransactionForm";

export default function AddTransactionScreen({ navigation }) {
  const guardarTransaccion = async (transaction) => {
    try {
      await API.post("/transactions", transaction);
      navigation.navigate("Transactions");
    } catch (error) {
      console.log(
        error?.response?.data || error?.message || "Error desconocido",
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
