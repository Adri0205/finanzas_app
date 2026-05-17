import { useContext } from "react";

import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";

import RegisterScreen from "../screens/RegisterScreen";

import AddTransactionScreen from "../screens/AddTransactionScreen";

import HomeScreen from "../screens/HomeScreen";

import TransactionScreen from "../screens/TransactionScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, loading } = useContext(AuthContext);
  if (loading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
            />
            <Stack.Screen name="Transactions" component={TransactionScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
