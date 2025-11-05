const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Public: Get all users
router.get("/users-public", async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Public: Delete user
router.delete("/users-public/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

// ✅ Public: Update role
router.put("/users-public/:id", async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ msg: "User role updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
});

module.exports = router;
