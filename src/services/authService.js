const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const ALLOWED_ROLES = ['buyer', 'farmer', 'expert'];

exports.generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in environment variables');
  }

  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '30d' }
  );
};

exports.registerUser = async ({ name, email, password, role }) => {
  const normalizedRole = ALLOWED_ROLES.includes(role) ? role : 'buyer';

  const user = await User.create({
    name,
    email,
    password,
    role: normalizedRole,
  });

  return user;
};

exports.authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  return user;
};
