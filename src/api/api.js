import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


const API = axios.create({
  baseURL: "http://192.168.1.20:3000/api",
});


API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");


    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }


    return config;
  },
  (error) => Promise.reject(error),
);


export default API;
