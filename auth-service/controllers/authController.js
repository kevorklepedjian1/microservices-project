import { registerUser, loginUser } from '../services/authService.js';

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await registerUser({ name, email, password, role });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export { register, login };