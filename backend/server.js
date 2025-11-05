require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const adminRoutes = require("./routes/admin");

const authRoutes = require('./routes/auth');
const recordRoutes = require('./routes/records');

const app = express();

// 🔒 Security middleware
app.use(helmet());
app.use(cors({ origin: true })); // restrict origins in production
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// 🚦 Rate limiter (100 requests/minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});
app.use(limiter);

// 🧭 Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", require("./routes/publicUsers"));

// Root route
app.get('/', (req, res) => res.send({ ok: true }));

// 🌐 Server + DB connection
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app; // for tests
