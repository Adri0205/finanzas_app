import { useEffect, useMemo, useState } from "react";


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


export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const obtenerTransacciones = async () => {
    try {
      const response = await API.get("/transactions");


      setTransactions(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };


  useEffect(() => {
    obtenerTransacciones();
  }, []);


  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (
          categoryFilter &&
          !transaction.category_name
            .toLowerCase()
            .includes(categoryFilter.toLowerCase())
        ) {
          return false;
        }


        if (
          accountFilter &&
          !transaction.account_name
            .toLowerCase()
            .includes(accountFilter.toLowerCase())
        ) {
          return false;
        }


        const date = transaction.transaction_date?.slice(0, 10) || "";


        if (startDate && date < startDate) {
          return false;
        }


        if (endDate && date > endDate) {
          return false;
        }


        return true;
      }),
    [transactions, categoryFilter, accountFilter, startDate, endDate],
  );


  const limpiarFiltros = () => {
    setCategoryFilter("");
    setAccountFilter("");
    setStartDate("");
    setEndDate("");
  };


  const eliminar = (id) => {
    Alert.alert("Eliminar", "¿Desea eliminar esta transacción?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/transactions/${id}`);


            obtenerTransacciones();
          } catch (error) {
            console.log(error.response?.data || error.message);
          }
        },
      },
    ]);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transacciones</Text>


      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("AddTransaction")}
      >
        <Text style={styles.primaryButtonText}>Agregar transacción</Text>
      </TouchableOpacity>


      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Filtros</Text>


        <TextInput
          placeholder="Categoría"
          value={categoryFilter}
          onChangeText={setCategoryFilter}
          style={styles.input}
        />


        <TextInput
          placeholder="Cuenta"
          value={accountFilter}
          onChangeText={setAccountFilter}
          style={styles.input}
        />


        <View style={styles.dateRow}>
          <TextInput
            placeholder="Desde (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
            style={[styles.input, styles.dateInput]}
          />


          <TextInput
            placeholder="Hasta (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
            style={[styles.input, styles.dateInput]}
          />
        </View>


        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={limpiarFiltros}
        >
          <Text style={styles.secondaryButtonText}>Limpiar filtros</Text>
        </TouchableOpacity>
      </View>


      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            No hay transacciones para mostrar.
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditTransaction", {
                transaction: item,
              })
            }
            onLongPress={() => eliminar(item.id)}
            style={styles.transactionCard}
          >
            <View style={styles.transactionHeader}>
              <Text
                style={[
                  styles.amount,
                  item.type === "ingreso" ? styles.income : styles.expense,
                ]}
              >
                {item.type === "ingreso" ? "+" : "-"}${item.amount}
              </Text>
              <Text style={styles.dateText}>
                {item.transaction_date?.slice(0, 10)}
              </Text>
            </View>


            <Text style={styles.textLine}>{item.category_name}</Text>
            <Text style={styles.textLine}>{item.account_name}</Text>
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#2f80ed",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  filterSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2f80ed",
    fontWeight: "600",
  },
  transactionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  income: {
    color: "#219653",
  },
  expense: {
    color: "#eb5757",
  },
  dateText: {
    color: "#666",
  },
  textLine: {
    color: "#333",
  },
  description: {
    marginTop: 8,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});