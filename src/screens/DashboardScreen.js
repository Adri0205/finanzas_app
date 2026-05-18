import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import API from "../api/api";
import { Badge, Card, Container, Section } from "../components";
import { theme } from "../theme";

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [transactionsResponse, accountsResponse] = await Promise.all([
        API.get("/transactions"),
        API.get("/accounts"),
      ]);
      setTransactions(transactionsResponse.data || []);
      setAccounts(accountsResponse.data || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const monthTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const date = new Date(transaction.transaction_date || "");
        return (
          date.getFullYear() === currentYear && date.getMonth() === currentMonth
        );
      }),
    [transactions, currentMonth, currentYear],
  );

  const { incomeTotal, expenseTotal, netTotal } = useMemo(() => {
    let incomes = 0;
    let expenses = 0;

    monthTransactions.forEach((transaction) => {
      const amount = Number(transaction.amount || 0);
      if (transaction.type === "ingreso") incomes += amount;
      else if (transaction.type === "gasto") expenses += amount;
    });

    return {
      incomeTotal: incomes,
      expenseTotal: expenses,
      netTotal: incomes - expenses,
    };
  }, [monthTransactions]);

  const expenseCategories = useMemo(() => {
    const map = {};
    monthTransactions.forEach((t) => {
      if (t.type !== "gasto") return;
      const name = t.category_name || "Sin categoría";
      const amount = Number(t.amount || 0);
      map[name] = (map[name] || 0) + amount;
    });
    const list = Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const total = list.reduce((s, c) => s + c.amount, 0);
    const colors = [
      theme.colors.primary[500],
      theme.colors.secondary[500],
      theme.colors.accent[500],
      theme.colors.warning,
      theme.colors.error,
    ];
    return list.map((c, i) => ({
      ...c,
      percentage: total > 0 ? (c.amount / total) * 100 : 0,
      color: colors[i % colors.length],
    }));
  }, [monthTransactions]);

  if (loading) {
    return (
      <Container style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[500]]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Dashboard</Text>

        <View style={styles.summaryRow}>
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryIconBg}>
                <MaterialCommunityIcons
                  name="plus-circle"
                  size={24}
                  color={theme.colors.success}
                />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Ingresos</Text>
                <Text style={styles.incomeValue}>
                  ${incomeTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryIconBgExpense}>
                <MaterialCommunityIcons
                  name="minus-circle"
                  size={24}
                  color={theme.colors.error}
                />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Gastos</Text>
                <Text style={styles.expenseValue}>
                  ${expenseTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <Card
          variant="elevated"
          style={[
            styles.netCard,
            netTotal >= 0 ? styles.netCardPositive : styles.netCardNegative,
          ]}
        >
          <Text style={styles.netLabel}>Saldo neto del mes</Text>
          <Text
            style={[
              styles.netValue,
              netTotal >= 0 ? styles.incomeValue : styles.expenseValue,
            ]}
          >
            ${netTotal.toFixed(2)}
          </Text>
        </Card>

        {expenseCategories.length > 0 && (
          <Section title="Top gastos por categoría">
            {expenseCategories.map((cat, idx) => (
              <View key={idx} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: cat.color }]}
                  />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryAmount}>
                    ${cat.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </Section>
        )}

        {accounts.length > 0 && (
          <Section title="Saldo por cuenta">
            {accounts.map((account) => {
              const balance = Number(account.balance ?? 0);
              return (
                <Card
                  key={account.id}
                  variant="outlined"
                  style={styles.accountCardItem}
                >
                  <View style={styles.accountItemContent}>
                    <View style={styles.accountItemInfo}>
                      <Text style={styles.accountItemName}>{account.name}</Text>
                      <Text style={styles.accountItemBalance}>
                        ${balance.toFixed(2)}
                      </Text>
                    </View>
                    <Badge
                      label={balance >= 0 ? "Positivo" : "Negativo"}
                      variant={balance >= 0 ? "success" : "error"}
                      size="sm"
                    />
                  </View>
                </Card>
              );
            })}
          </Section>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing[6],
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing[12],
  },
  loadingText: {
    marginTop: theme.spacing[3],
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.base,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  summaryCard: {
    flex: 1,
    padding: theme.spacing[3],
    minHeight: 100,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  summaryIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  summaryIconBgExpense: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  incomeValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.success,
  },
  expenseValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.error,
  },
  netCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
    alignItems: "center",
  },
  netCardPositive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[200],
  },
  netCardNegative: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  netLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[2],
  },
  netValue: {
    fontSize: theme.typography.sizes["3xl"],
    fontWeight: theme.typography.weights.bold,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  categoryName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  categoryRight: {
    flex: 1,
    marginLeft: theme.spacing[3],
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 2,
    marginBottom: theme.spacing[1],
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  categoryAmount: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: "right",
  },
  accountCardItem: {
    marginBottom: theme.spacing[2],
    padding: theme.spacing[3],
  },
  accountItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountItemInfo: {
    flex: 1,
  },
  accountItemName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  accountItemBalance: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary[500],
  },
});
