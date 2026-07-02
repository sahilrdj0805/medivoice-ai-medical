import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// GET /api/admin/doctors — list all doctors
router.get("/doctors", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctors", error: err.message });
  }
});

// POST /api/admin/doctors — create a new doctor
router.post("/doctors", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { specialist, name, image, voice, agentPrompt } = req.body;

    if (!specialist || !name || !agentPrompt) {
      return res.status(400).json({ message: "specialist, name, and agentPrompt are required" });
    }

    const doctor = await Doctor.create({
      specialist,
      name,
      image: image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, "")}`,
      voice: voice || "en-US-AriaNeural",
      agentPrompt,
    });

    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Failed to create doctor", error: err.message });
  }
});

// PUT /api/admin/doctors/:id — update a doctor
router.put("/doctors/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { specialist, name, image, voice, agentPrompt } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { specialist, name, image, voice, agentPrompt },
      { new: true, runValidators: true }
    );

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Failed to update doctor", error: err.message });
  }
});

// DELETE /api/admin/doctors/:id — delete a doctor
router.delete("/doctors/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete doctor", error: err.message });
  }
});

export default router;
