import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import API from "../api/api";
import { Badge, Card, Container, Input } from "../components";
import { theme } from "../theme";

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

export default function BudgetsScreen() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/budgets?month=${month}`);
      setBudgets(
        response.data.budgets.map((budget) => ({
          ...budget,
          budget_limit: Number(budget.budget_limit),
          spent: Number(budget.spent),
          inputValue:
            Number(budget.budget_limit) > 0
              ? String(Number(budget.budget_limit))
              : "",
        })),
      );
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [month]);

  // Calcular presupuesto global
  const globalBudget = useMemo(() => {
    let totalLimit = 0;
    let totalSpent = 0;

    budgets.forEach((budget) => {
      const limit = Number(budget.budget_limit ?? 0);
      const spent = Number(budget.spent ?? 0);
      totalLimit += limit;
      totalSpent += spent;
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
        message = `Has superado tu presupuesto en $${(totalSpent - totalLimit).toFixed(2)}`;
      } else if (totalSpent >= totalLimit * 0.8) {
        statusColor = theme.colors.warning;
        statusLabel = "Próximo al límite";
        statusIcon = "exclamation";
        backgroundColor = "#FEF3C7";
        message = `Cuidado: Has usado ${Math.round(percent)}% de tu presupuesto`;
      } else {
        message = `Has utilizado ${Math.round(percent)}% de tu presupuesto`;
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

  const updateBudgetInput = (categoryId, value) => {
    setBudgets((current) =>
      current.map((item) =>
        item.category_id === categoryId ? { ...item, inputValue: value } : item,
      ),
    );
  };

  const saveBudget = async (item) => {
    const value = item.inputValue.trim();
    const parsedLimit = value === "" ? 0 : Number(value);

    if (value !== "" && (Number.isNaN(parsedLimit) || parsedLimit < 0)) {
      Alert.alert("Error", "Ingrese un presupuesto válido mayor o igual a 0.");
      return;
    }

    try {
      await API.post("/budgets", {
        category_name: item.category_name,
        budget_limit: parsedLimit,
        month,
      });

      await loadBudgets();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message);
    }
  };

  const renderBudgetItem = ({ item }) => {
    const limit = Number(item.budget_limit ?? 0);
    const spent = Number(item.spent ?? 0);
    const percent = limit > 0 ? Math.min((spent / limit) * 100, 999) : 0;
    const reachedLimit = limit > 0 && spent >= limit;
    const nearLimit = limit > 0 && spent >= limit * 0.8 && spent < limit;

    let statusColor = theme.colors.success;
    let statusLabel = "Bajo control";
    let statusIcon = "check-circle";

    if (reachedLimit) {
      statusColor = theme.colors.error;
      statusLabel = "Límite excedido";
      statusIcon = "alert-circle";
    } else if (nearLimit) {
      statusColor = theme.colors.warning;
      statusLabel = "Próximo al límite";
      statusIcon = "exclamation";
    }

    return (
      <Card variant="elevated" style={styles.budgetCard}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.category_name}</Text>
            <Text style={styles.budgetMeta}>
              {limit > 0 ? `Límite: $${limit.toFixed(2)}` : "Sin límite"}
            </Text>
          </View>
          <Badge
            label={statusLabel}
            variant={reachedLimit ? "error" : nearLimit ? "warning" : "success"}
            size="sm"
          />
        </View>

        {limit > 0 && (
          <>
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((spent / limit) * 100, 100)}%`,
                      backgroundColor: statusColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentText}>{Math.round(percent)}%</Text>
            </View>

            <View style={styles.spentRow}>
              <Text style={styles.spentLabel}>Gastado</Text>
              <Text style={styles.spentAmount}>
                ${spent.toFixed(2)} de ${limit.toFixed(2)}
              </Text>
            </View>
          </>
        )}

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Input
              label="Nuevo límite"
              placeholder="Ingrese monto"
              value={item.inputValue}
              onChangeText={(value) =>
                updateBudgetInput(item.category_id, value)
              }
              keyboardType="decimal-pad"
            />
          </View>
          <Pressable
            style={[styles.saveButton, { marginTop: theme.spacing[6] }]}
            onPress={() => saveBudget(item)}
          >
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={theme.colors.text.inverse}
            />
          </Pressable>
        </View>
      </Card>
    );
  };

  return (
    <Container>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.category_id.toString()}
        ListHeaderComponent={() => (
          <>
            <Text style={styles.title}>Presupuestos</Text>

            <View style={styles.monthSelector}>
              <Pressable
                onPress={() => {
                  const [y, m] = month.split("-");
                  const date = new Date(parseInt(y), parseInt(m) - 2);
                  setMonth(date.toISOString().slice(0, 7));
                }}
                style={styles.monthButton}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={theme.colors.primary[500]}
                />
              </Pressable>

              <Text style={styles.monthText}>
                {new Date(month + "-01").toLocaleString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>

              <Pressable
                onPress={() => {
                  const [y, m] = month.split("-");
                  const date = new Date(parseInt(y), parseInt(m));
                  setMonth(date.toISOString().slice(0, 7));
                }}
                style={styles.monthButton}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={theme.colors.primary[500]}
                />
              </Pressable>
            </View>

            {globalBudget.totalLimit > 0 && (
              <Card
                variant="elevated"
                style={[
                  styles.globalBudgetCard,
                  { backgroundColor: globalBudget.backgroundColor },
                ]}
              >
                <View style={styles.globalHeaderRow}>
                  <View>
                    <Text style={styles.globalLabel}>Presupuesto Global</Text>
                    <Text
                      style={[
                        styles.globalAmount,
                        { color: globalBudget.statusColor },
                      ]}
                    >
                      ${globalBudget.totalSpent.toFixed(2)} de $
                      {globalBudget.totalLimit.toFixed(2)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={globalBudget.statusIcon}
                    size={32}
                    color={globalBudget.statusColor}
                  />
                </View>

                <View style={styles.globalProgressTrack}>
                  <View
                    style={[
                      styles.globalProgressFill,
                      {
                        width: `${globalBudget.percent}%`,
                        backgroundColor: globalBudget.statusColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.globalStatusRow}>
                  <Text
                    style={[
                      styles.globalStatus,
                      { color: globalBudget.statusColor },
                    ]}
                  >
                    {globalBudget.statusLabel}
                  </Text>
                  <Text style={styles.globalPercent}>
                    {Math.round(globalBudget.percent)}%
                  </Text>
                </View>

                {globalBudget.message && (
                  <Text style={styles.globalMessage}>
                    {globalBudget.message}
                  </Text>
                )}
              </Card>
            )}

            <Text style={styles.subtitle}>
              Gestiona tus límites por categoría
            </Text>
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="target"
              size={64}
              color={theme.colors.neutral[300]}
              style={{ marginBottom: theme.spacing[3] }}
            />
            <Text style={styles.emptyText}>
              No hay categorías registradas aún.
            </Text>
          </View>
        )}
        renderItem={renderBudgetItem}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadBudgets}
            colors={[theme.colors.primary[500]]}
          />
        }
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
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[4],
    paddingHorizontal: theme.spacing[2],
  },
  monthButton: {
    padding: theme.spacing[2],
  },
  monthText: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    textTransform: "capitalize",
  },
  globalBudgetCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[6],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  globalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  globalLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[1],
  },
  globalAmount: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  globalProgressTrack: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: theme.spacing[3],
  },
  globalProgressFill: {
    height: "100%",
    borderRadius: 5,
  },
  globalStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[2],
  },
  globalStatus: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
  },
  globalPercent: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  globalMessage: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    fontStyle: "italic",
    marginTop: theme.spacing[2],
  },
  budgetCard: {
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing[3],
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  budgetMeta: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  percentText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    minWidth: 40,
    textAlign: "right",
  },
  spentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  spentLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  spentAmount: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing[2],
  },
  saveButton: {
    backgroundColor: theme.colors.primary[500],
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
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
