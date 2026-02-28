import { registerUser, loginUser } from "../services/authService.js";
import { forwardRequest } from "../services/bloodService.js";

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
};

const forwardBlood = async (req, res) => {
  try {
    const raw = req.url || req.originalUrl || "";
    const subPath = raw.startsWith("/") ? raw : `/${raw}`;
    const path = subPath.startsWith("/blood") ? subPath : `/blood${subPath}`;
    const result = await forwardRequest(req, path);
    res.json(result);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || err.response?.data?.message || err.message;
    res.status(status).json({ message });
  }
};

export { register, login, forwardBlood };