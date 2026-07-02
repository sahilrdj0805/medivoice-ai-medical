import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { askAi } from "./ai.routes.js";

const router = express.Router();

const correctTranscript = async (text) => {
  try {
    if (!text || !text.trim()) return text;
    const response = await askAi([
      {
        role: "system",
        content: "You are an expert voice transcription corrector. Clean up the provided raw speech-to-text transcript. Fix any spelling mistakes, typos, incorrect medical words, grammar, and add proper punctuation. Keep the original intent and tone. Return ONLY the corrected text. Do not add quotes, warnings, or explanations.",
      },
      {
        role: "user",
        content: text,
      }
    ]);
    return response.trim();
  } catch (err) {
    console.error("Transcript correction error:", err);
    return text;
  }
};

// POST /api/sessions — create new session
router.post("/", verifyToken, async (req, res) => {
  try {
    const { doctor, symptoms } = req.body;

    if (req.user.credits < 10)
      return res.status(403).json({ message: "Insufficient credits. Please buy more credits (10 credits required per consultation)." });

    const correctedSymptoms = await correctTranscript(symptoms);

    const session = await Session.create({
      userId: req.user._id,
      doctor,
      symptoms: correctedSymptoms,
      messages: [],
    });

    // Deduct 10 credits immediately from the user
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: -10 } });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/sessions — get all sessions for user
router.get("/", verifyToken, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-messages");

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/sessions/:id — get single session with messages
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/sessions/:id/messages — add a message
router.post("/:id/messages", verifyToken, async (req, res) => {
  try {
    let { role, content } = req.body;

    if (role === "user") {
      content = await correctTranscript(content);
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $push: { messages: { role, content } } },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: "Session not found" });



    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/sessions/:id/end — end session and save report
router.put("/:id/end", verifyToken, async (req, res) => {
  try {
    const { report } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        status: "ended",
        report: { ...report, generatedAt: new Date() },
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/sessions/:id — delete a session
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
