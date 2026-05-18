import { createContext, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOGIN
  const login = async (email, password) => {
    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.token;
      const userData = response.data.user;

      setUserToken(token);
      setUser(userData);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.log(error.response?.data);
      throw error;
    }
  };

  // REGISTER
  const register = async (name, email, password) => {
    const response = await API.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  };

  // LOGOUT
  const logout = async () => {
    setUserToken(null);
    setUser(null);

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  // PERSISTENCIA
  const isLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (token) {
        setUserToken(token);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        register,
        logout,
        userToken,
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
