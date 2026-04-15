import express from "express";
import User from "../models/User.js";

const router = express.Router();

// 🔐 Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ VALIDATION ADD
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    // ✅ CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists"
      });
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    res.json({
      message: "User registered successfully",
      user
    });

  } catch (err) {
    console.log("❌ REGISTER ERROR:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

export default router;