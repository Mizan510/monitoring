const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// ----------------------
// Register User/Admin
// ----------------------
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, adminId } = req.body;

    try {
      let existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ msg: 'Email already registered' });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        passwordHash,
        role: role === 'admin' ? 'admin' : 'user',
        adminId: role === 'user' ? adminId : null,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id, name: newUser.name, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          adminId: newUser.adminId,
        },
      });
    } catch (err) {
      console.error('Register Error:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// ----------------------
// Login
// ----------------------
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      const token = jwt.sign(
        { id: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          adminId: user.adminId,
        },
      });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// ----------------------
// ✅ Get users under logged-in admin only
// ----------------------
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const loggedUser = await User.findById(req.user.id);

    if (!loggedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let query = {};

    if (loggedUser.role === 'admin') {
      query = { role: 'user', adminId: loggedUser._id };
    } else {
      query = { _id: loggedUser._id };
    }

    const users = await User.find(query).select('_id name adminId role');
    res.json({ users });
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ----------------------
// Get logged-in user info
// ----------------------
router.get('/me', authMiddleware, async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// ----------------------
// Get all admins (for dropdown)
// ----------------------
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find(
      { role: 'admin' },
      '_id name'
    ).sort({ name: 1 });

    res.json({ admins });
  } catch (err) {
    console.error('Get Admins Error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
