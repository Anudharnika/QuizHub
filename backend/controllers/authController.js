const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mockStore = require('../utils/mockStore');
const { getMongoStatus } = require('../config/db');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (getMongoStatus()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        stats: user.stats,
        token: generateToken(user._id)
      });
    } else {
      const existing = mockStore.findUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = mockStore.createUser({
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      });

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        stats: newUser.stats,
        token: generateToken(newUser._id)
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    let user;
    if (getMongoStatus()) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = mockStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      stats: user.stats,
      achievements: user.achievements,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userData } = req.user._doc || req.user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

// @desc    Forgot Password Mock UI Handler
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  res.json({ message: `Password reset instructions sent to ${email} (Demo mode).` });
};

// @desc    Reset Password Mock UI Handler
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  res.json({ message: 'Password successfully updated. You can now log in.' });
};

module.exports = { signup, login, getMe, forgotPassword, resetPassword };
