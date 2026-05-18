import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import { TouchableOpacity } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { theme } from "../theme";

import AccountsScreen from "../screens/AccountsScreen";
import AddTransactionScreen from "../screens/AddTransactionScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import EditTransactionScreen from "../screens/EditTransactionScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TransactionScreen from "../screens/TransactionScreen";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: theme.colors.primary[500],
  },
  headerTintColor: theme.colors.text.inverse,
  headerTitleStyle: {
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.lg,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: theme.colors.background,
  },
};

const getHeaderOptions = (title, icon) => ({
  title,
  headerBackTitleVisible: false,
  headerLeft: ({ onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ marginLeft: 8, padding: 4 }}
    >
      <MaterialCommunityIcons
        name="chevron-left"
        size={28}
        color={theme.colors.text.inverse}
      />
    </TouchableOpacity>
  ),
  headerRight: icon
    ? ({ pressColor }) => (
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={theme.colors.text.inverse}
          style={{ marginRight: 16 }}
        />
      )
    : undefined,
});

export default function AppNavigator() {
  const { userToken, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {userToken ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: "Inicio",
                headerLeft: undefined,
                headerRight: () => (
                  <MaterialCommunityIcons
                    name="wallet"
                    size={24}
                    color={theme.colors.text.inverse}
                    style={{ marginRight: 16 }}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={getHeaderOptions("Dashboard", "chart-line")}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={getHeaderOptions("Nueva Transacción", "plus")}
            />
            <Stack.Screen
              name="EditTransaction"
              component={EditTransactionScreen}
              options={getHeaderOptions("Editar Transacción", "pencil")}
            />
            <Stack.Screen
              name="Accounts"
              component={AccountsScreen}
              options={getHeaderOptions("Mis Cuentas", "bank")}
            />
            <Stack.Screen
              name="Budgets"
              component={BudgetsScreen}
              options={getHeaderOptions("Presupuestos", "target")}
            />
            <Stack.Screen
              name="Transactions"
              component={TransactionScreen}
              options={getHeaderOptions("Transacciones", "swap-horizontal")}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: "Iniciar Sesión",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                title: "Crear Cuenta",
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
