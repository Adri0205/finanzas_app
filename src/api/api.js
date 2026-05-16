import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.20:3000/api",
});

export default API;
