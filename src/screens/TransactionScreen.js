import { useCallback, useEffect, useMemo, useState } from "react";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import API from "../api/api";
import { Button, Card, Container, SelectInput } from "../components";
import { theme } from "../theme";

const categoryOptions = [
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

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    obtenerTransacciones();
  }, []);

  const obtenerTransacciones = useCallback(async () => {
    try {
      const [transResponse, accResponse] = await Promise.all([
        API.get("/transactions"),
        API.get("/accounts"),
      ]);
      setTransactions(transResponse.data || []);
      setCategories(categoryOptions);
      setAccounts(
        (accResponse.data || []).map((acc) => ({
          value: acc.name || acc,
          label: acc.name || acc,
        })),
      );
    } catch (error) {
      console.log(
        error?.response?.data || error?.message || "Error desconocido",
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      obtenerTransacciones();
    }, [obtenerTransacciones]),
  );

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        if (categoryFilter && transaction.category_name !== categoryFilter) {
          return false;
        }

        if (accountFilter && transaction.account_name !== accountFilter) {
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
            Alert.alert(
              "Error",
              error.response?.data?.message || error.message,
            );
          }
        },
      },
    ]);
  };

  const getTypeIcon = (type) => {
    return type === "ingreso" ? "plus-circle" : "minus-circle";
  };

  const getTypeColor = (type) => {
    return type === "ingreso" ? theme.colors.success : theme.colors.error;
  };

  return (
    <Container>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.title}>Transacciones</Text>

            <View style={styles.filtersContainer}>
              <SelectInput
                label="Categoría"
                placeholder="Todas las categorías"
                value={categoryFilter}
                onValueChange={setCategoryFilter}
                options={categories}
              />

              <SelectInput
                label="Cuenta"
                placeholder="Todas las cuentas"
                value={accountFilter}
                onValueChange={setAccountFilter}
                options={accounts}
              />

              <Button
                title="Limpiar filtros"
                onPress={limpiarFiltros}
                variant="ghost"
                size="sm"
              />
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={64}
              color={theme.colors.neutral[300]}
              style={{ marginBottom: theme.spacing[3] }}
            />
            <Text style={styles.emptyText}>
              No hay transacciones para mostrar.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const typeColor = getTypeColor(item.type);
          const typeIcon = getTypeIcon(item.type);

          return (
            <View style={styles.cardWrapper}>
              <Card variant="elevated" style={styles.transactionCard}>
                <View style={styles.transactionContent}>
                  <View
                    style={[
                      styles.iconBg,
                      { backgroundColor: `${typeColor}15` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={typeIcon}
                      size={24}
                      color={typeColor}
                    />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.category}>{item.category_name}</Text>
                    <Text style={styles.account}>{item.account_name}</Text>
                    {item.description && (
                      <Text style={styles.description}>{item.description}</Text>
                    )}
                  </View>

                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.amount,
                        {
                          color: typeColor,
                        },
                      ]}
                    >
                      {item.type === "ingreso" ? "+" : "-"}$
                      {Number(item.amount).toFixed(2)}
                    </Text>
                    <Text style={styles.dateText}>
                      {item.transaction_date?.slice(0, 10)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => eliminar(item.id)}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={20}
                        color={theme.colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </View>
          );
        }}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  filtersContainer: {
    marginBottom: theme.spacing[4],
  },
  cardWrapper: {
    marginBottom: theme.spacing[2],
  },
  deleteBtn: {
    marginTop: theme.spacing[1],
  },
  transactionCard: {
    padding: theme.spacing[3],
  },
  transactionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  transactionInfo: {
    flex: 1,
  },
  category: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  account: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  description: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    fontStyle: "italic",
  },
  transactionRight: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  amount: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing[1],
  },
  dateText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing[12],
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing[4],
  },
});
