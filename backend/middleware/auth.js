const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user info
exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ msg: 'Unauthorized' });

    req.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role.toLowerCase(),
      email: user.email,
    };

    next();
  } catch (err) {
    console.error('authMiddleware error:', err);
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// Admin-only middleware
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ msg: 'Forbidden: Admins only' });
  }
  next();
};
