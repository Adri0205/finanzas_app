import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Container } from "../components";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme";

export default function HomeScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      description: "Ver resumen financiero",
      icon: "chart-line",
      color: theme.colors.primary[500],
      onPress: () => navigation.navigate("Dashboard"),
    },
    {
      id: "transactions",
      name: "Transacciones",
      description: "Administrar tus transacciones",
      icon: "swap-horizontal",
      color: theme.colors.accent[500],
      onPress: () => navigation.navigate("Transactions"),
    },
    {
      id: "add-transaction",
      name: "Agregar Transacción",
      description: "Registrar nueva transacción",
      icon: "plus-circle",
      color: theme.colors.success,
      onPress: () => navigation.navigate("AddTransaction"),
    },
    {
      id: "accounts",
      name: "Cuentas",
      description: "Administrar tus cuentas",
      icon: "bank",
      color: theme.colors.secondary[500],
      onPress: () => navigation.navigate("Accounts"),
    },
    {
      id: "budgets",
      name: "Presupuestos",
      description: "Definir y controlar presupuestos",
      icon: "target",
      color: theme.colors.warning,
      onPress: () => navigation.navigate("Budgets"),
    },
  ];

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIconContainer}>
            <MaterialCommunityIcons
              name="wallet"
              size={48}
              color={theme.colors.primary[500]}
            />
          </View>
          <Text style={styles.welcomeTitle}>
            Hola, {user?.name || "Usuario"}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Gestiona tus finanzas de forma inteligente
          </Text>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              activeOpacity={0.7}
              style={styles.cardWrapper}
            >
              <Card variant="elevated" style={styles.menuCard}>
                <View
                  style={[
                    styles.iconBg,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={32}
                    color={item.color}
                  />
                </View>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Cerrar sesión"
            onPress={logout}
            variant="danger"
            size="lg"
          />
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    alignItems: "center",
    marginBottom: theme.spacing[8],
    marginTop: theme.spacing[4],
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  welcomeTitle: {
    fontSize: theme.typography.sizes["2xl"],
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  welcomeSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing[6],
  },
  cardWrapper: {
    width: "48%",
    marginBottom: theme.spacing[3],
  },
  menuCard: {
    minHeight: 180,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[2],
  },
  menuName: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: "center",
    marginBottom: theme.spacing[1],
  },
  menuDescription: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    lineHeight: 14,
  },
  logoutSection: {
    marginBottom: theme.spacing[6],
  },
  scrollContent: {
    paddingBottom: theme.spacing[10],
  },
});
