import { createContext, useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import API from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);

  const [loading, setLoading] = useState(true);

  // LOGIN
  const login = async (email, password) => {
    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const token = response.data.token;

      setUserToken(token);

      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // REGISTER
  const register = async (name, email, password) => {
    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      login(email, password);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // LOGOUT
  const logout = async () => {
    setUserToken(null);

    await AsyncStorage.removeItem("token");
  };

  // PERSISTENCIA
  const isLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        setUserToken(token);
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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
