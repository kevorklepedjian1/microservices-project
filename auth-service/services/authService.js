import User from '../models/userModel.js';
import  jwt  from'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const registerUser = async ({ name, email, password, role }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error('Email already exists');

  const user = await User.create({ name, email, password, role });
  return { token: generateToken(user), role: user.role };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error('Invalid credentials');

  return { token: generateToken(user), role: user.role };
};

export { registerUser, loginUser, generateToken };