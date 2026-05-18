import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import API from "../api/api";
import { Button, Card, Container, Input, Section } from "../components";
import { theme } from "../theme";

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAccounts = async () => {
    try {
      const response = await API.get("/accounts");
      setAccounts(response.data);
    } catch (error) {
      console.log(
        error?.response?.data || error?.message || "Error desconocido",
      );
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

    setLoading(true);
    try {
      await API.post("/accounts", { name: name.trim() });
      setName("");
      await loadAccounts();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo crear la cuenta",
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = (id) => {
    Alert.alert("Eliminar cuenta", "¿Desea eliminar esta cuenta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await API.delete(`/accounts/${id}`);
            await loadAccounts();
          } catch (error) {
            Alert.alert(
              "Error",
              error.response?.data?.message ||
                error.message ||
                "No se pudo eliminar la cuenta",
            );
          }
        },
      },
    ]);
  };

  const HeaderComponent = () => (
    <>
      <Text style={styles.title}>Mis Cuentas</Text>

      <Section title="Nueva cuenta">
        <Input
          label="Nombre de la cuenta"
          placeholder="Ej. Efectivo, Ahorros"
          value={name}
          onChangeText={setName}
        />

        <Button
          title="Crear cuenta"
          onPress={addAccount}
          loading={loading}
          size="lg"
        />
      </Section>

      {accounts.length > 0 && (
        <Text style={styles.sectionTitle}>Mis cuentas</Text>
      )}
    </>
  );

  return (
    <Container>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bank"
              size={64}
              color={theme.colors.neutral[300]}
              style={{ marginBottom: theme.spacing[3] }}
            />
            <Text style={styles.emptyText}>
              No hay cuentas registradas aún.
            </Text>
            <Text style={styles.emptySubtext}>
              Crea tu primera cuenta para empezar
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const balance = Number(item.balance ?? 0);
          const isPositive = balance >= 0;

          return (
            <Card
              variant="elevated"
              style={styles.accountCard}
              onPress={() => {
                Alert.alert("Opciones de cuenta", `${item.name}`, [
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => deleteAccount(item.id),
                  },
                  {
                    text: "Cancelar",
                    style: "cancel",
                  },
                ]);
              }}
            >
              <View style={styles.accountContent}>
                <View style={styles.accountLeft}>
                  <View
                    style={[
                      styles.accountIcon,
                      {
                        backgroundColor: isPositive
                          ? theme.colors.success + "15"
                          : theme.colors.error + "15",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="bank"
                      size={24}
                      color={
                        isPositive ? theme.colors.success : theme.colors.error
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.accountName}>{item.name}</Text>
                    <Text style={styles.accountStatus}>
                      {isPositive ? "Saldo positivo" : "Saldo negativo"}
                    </Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text
                    style={[
                      styles.accountBalance,
                      isPositive
                        ? styles.balancePositive
                        : styles.balanceNegative,
                    ]}
                  >
                    ${balance.toFixed(2)}
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
  accountCard: {
    marginBottom: theme.spacing[3],
    padding: theme.spacing[4],
  },
  accountContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  accountName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  accountStatus: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  accountRight: {
    alignItems: "flex-end",
  },
  accountBalance: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  balancePositive: {
    color: theme.colors.success,
  },
  balanceNegative: {
    color: theme.colors.error,
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
    marginBottom: theme.spacing[1],
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  listContent: {
    flexGrow: 1,
  },
});
