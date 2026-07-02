import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        role: user.role,
        age: user.age,
        height: user.height,
        weight: user.weight,
        gender: user.gender,
        medicalHistory: user.medicalHistory,
        hasCompletedProfile: user.hasCompletedProfile
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        role: user.role,
        age: user.age,
        height: user.height,
        weight: user.weight,
        gender: user.gender,
        medicalHistory: user.medicalHistory,
        hasCompletedProfile: user.hasCompletedProfile
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json({ user });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

// PUT /api/auth/profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, age, height, weight, gender, medicalHistory } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    user.age = Number(age);
    user.height = Number(height);
    user.weight = Number(weight);
    user.gender = gender;
    user.medicalHistory = medicalHistory || "";
    user.hasCompletedProfile = true;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
        role: user.role,
        age: user.age,
        height: user.height,
        weight: user.weight,
        gender: user.gender,
        medicalHistory: user.medicalHistory,
        hasCompletedProfile: user.hasCompletedProfile
      }
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
