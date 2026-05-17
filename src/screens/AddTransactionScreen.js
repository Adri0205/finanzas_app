import { ScrollView } from "react-native";


import API from "../api/api";


import TransactionForm from "../components/TransactionForm";


export default function AddTransactionScreen({ navigation }) {
  const guardarTransaccion = async (transaction) => {
    try {
      await API.post("/transactions", transaction);


      navigation.navigate("Transactions");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };


  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TransactionForm
        initialValues={{
          amount: "",
          type: "ingreso",
          category: "",
          account: "",
          description: "",
          transaction_date: new Date().toISOString().slice(0, 10),
        }}
        onSubmit={guardarTransaccion}
        submitLabel="Guardar transacción"
      />
    </ScrollView>
  );
}
