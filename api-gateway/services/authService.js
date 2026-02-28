import { AUTH_SERVICE } from "../config/serviceUrls.js";
import axios from "axios";

const registerUser = async (data) => {
  const res = await axios.post(`${AUTH_SERVICE}/auth/register`, data);
  return res.data;
};

const loginUser = async (data) => {
  const res = await axios.post(`${AUTH_SERVICE}/auth/login`, data);
  return res.data;
};

export { registerUser, loginUser };