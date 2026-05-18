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
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { month, startDate, endDate } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthNum = String(now.getMonth() + 1).padStart(2, "0");
    const m = `${year}-${monthNum}`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    return {
      month: m,
      startDate: `${m}-01`,
      endDate: `${m}-${String(lastDay).padStart(2, "0")}`,
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [transactionsResult, accountsResult, budgetsResult] =
        await Promise.allSettled([
          API.get(`/transactions?start_date=${startDate}&end_date=${endDate}`),
          API.get("/accounts"),
          API.get(`/budgets?month=${month}`),
        ]);

      if (transactionsResult.status === "fulfilled") {
        setTransactions(transactionsResult.value.data || []);
      } else {
        console.error(
          "Error al cargar transacciones:",
          transactionsResult.reason,
        );
      }

      if (accountsResult.status === "fulfilled") {
        setAccounts(accountsResult.value.data || []);
      } else {
        console.error("Error al cargar cuentas:", accountsResult.reason);
      }

      if (budgetsResult.status === "fulfilled") {
        setBudgets(
          (budgetsResult.value.data?.budgets || []).map((b) => ({
            ...b,
            budget_limit: Number(b.budget_limit),
            spent: Number(b.spent),
          })),
        );
      } else {
        console.error("Error al cargar presupuestos:", budgetsResult.reason);
      }
    } catch (error) {
      console.error("Error inesperado al cargar dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, month]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // transactions ya vienen filtrados por mes desde el backend
  const monthTransactions = transactions;

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

  const globalBudget = useMemo(() => {
    let totalLimit = 0;
    let totalSpent = 0;

    budgets.forEach((b) => {
      totalLimit += b.budget_limit;
      totalSpent += b.spent;
    });

    const percent =
      totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

    let statusColor = theme.colors.success;
    let statusLabel = "Bajo control";
    let statusIcon = "check-circle";
    let backgroundColor = "#D1FAE5";
    let message = "";

    if (totalLimit > 0) {
      if (totalSpent >= totalLimit) {
        statusColor = theme.colors.error;
        statusLabel = "¡Límite excedido!";
        statusIcon = "alert-circle";
        backgroundColor = "#FEE2E2";
        message = `Superado en $${(totalSpent - totalLimit).toFixed(2)}`;
      } else if (totalSpent >= totalLimit * 0.8) {
        statusColor = theme.colors.warning;
        statusLabel = "Próximo al límite";
        statusIcon = "exclamation";
        backgroundColor = "#FEF3C7";
        message = `${Math.round(percent)}% del presupuesto usado`;
      } else {
        message = `${Math.round(percent)}% del presupuesto usado`;
      }
    }

    return {
      totalLimit,
      totalSpent,
      percent,
      statusColor,
      statusLabel,
      statusIcon,
      backgroundColor,
      message,
    };
  }, [budgets]);

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

        {globalBudget.totalLimit > 0 && (
          <Card
            variant="elevated"
            style={[
              styles.budgetCard,
              { backgroundColor: globalBudget.backgroundColor },
            ]}
          >
            <View style={styles.budgetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.budgetTitle}>Presupuesto del mes</Text>
                <Text
                  style={[
                    styles.budgetAmount,
                    { color: globalBudget.statusColor },
                  ]}
                >
                  ${globalBudget.totalSpent.toFixed(2)} de $
                  {globalBudget.totalLimit.toFixed(2)}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={globalBudget.statusIcon}
                size={28}
                color={globalBudget.statusColor}
              />
            </View>
            <View style={styles.budgetProgressBar}>
              <View
                style={[
                  styles.budgetProgressFill,
                  {
                    width: `${globalBudget.percent}%`,
                    backgroundColor: globalBudget.statusColor,
                  },
                ]}
              />
            </View>
            <View style={styles.budgetFooter}>
              <Text
                style={[
                  styles.budgetStatus,
                  { color: globalBudget.statusColor },
                ]}
              >
                {globalBudget.statusLabel}
              </Text>
              <Text style={styles.budgetPercent}>
                {Math.round(globalBudget.percent)}%
              </Text>
            </View>
            {globalBudget.message ? (
              <Text
                style={[
                  styles.budgetMessage,
                  { color: globalBudget.statusColor },
                ]}
              >
                {globalBudget.message}
              </Text>
            ) : null}
          </Card>
        )}

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
  budgetCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing[3],
  },
  budgetTitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  budgetAmount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: theme.spacing[2],
  },
  budgetProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetStatus: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  budgetPercent: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  budgetMessage: {
    fontSize: theme.typography.sizes.xs,
    marginTop: theme.spacing[2],
  },
});
