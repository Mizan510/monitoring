const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Record = require("../models/Record"); // ✅ Make sure this model exists
const { authMiddleware } = require("../middleware/auth");

// ===================================
// ✅ Protected Routes (Admin Only)
// ===================================

// Get all users (admin only)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Delete user (admin only)
router.delete("/user/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// Update user (admin only)
router.put("/user/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { name, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true }
    ).select("-passwordHash");

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// ===================================
// ✅ Public Routes (No Login Required)
// ===================================

// 🟢 Get all users (public)
router.get("/users-public", async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// 🟢 Delete user (public)
router.delete("/users-public/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted successfully (public)" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// 🟢 Update user role (public)
router.put("/users-public/:id", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("name email role");
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// ===================================
// ✅ Public Routes for Submitted Data
// ===================================

// 🟢 Get all submitted records (public)
router.get("/all-records-public", async (req, res) => {
  try {
    const records = await Record.find()
      .populate("userId", "name role")
      .sort({ createdAt: -1 });

    const formatted = records.map((r) => ({
      _id: r._id,
      createdAt: r.createdAt,
      userName: r.userId?.name || "Unknown",
      userRole: r.userId?.role || "user",
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch records" });
  }
});

// 🟢 Delete submitted record (public)
router.delete("/all-records-public/:id", async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id);
    res.json({ msg: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to delete record" });
  }
});

module.exports = router;
