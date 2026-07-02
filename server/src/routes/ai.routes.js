import express from "express";
import axios from "axios";
import verifyToken from "../middleware/verifyToken.js";
import Doctor from "../models/Doctor.js";
import { EdgeTTS } from "node-edge-tts";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

export const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid messages array");
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // Very fast, reliable, and cheap/free via OpenRouter
        messages: messages,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AI Medical",
        },
        timeout: 60000,
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error("Empty response from AI service");
    }

    return content;
  } catch (error) {
    console.error("OpenRouter AI error:", error?.response?.data || error.message);
    throw error;
  }
};

// GET /api/ai/doctors
router.get("/doctors", verifyToken, async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});

// POST /api/ai/suggest-doctors
router.post("/suggest-doctors", verifyToken, async (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms) return res.status(400).json({ message: "Symptoms are required" });

  try {
    const allDoctors = await Doctor.find();
    const raw = await askAi([
      {
        role: "system",
        content: `You are a medical specialist routing assistant. NOTE: The user's input may contain typos, spelling mistakes, phonetic errors, or bad grammar (e.g., 'hedac' for headache, 'stomek pan' for stomach pain, 'hart ach' for heart ache, 'reches' for rashes). You must mentally correct these typos, analyze the true medical intent, and route them correctly. Here are the available doctors: ${JSON.stringify(
          allDoctors.map(({ _id, specialist, name, image, voice }) => ({
            id: _id, specialist, name, image, voice,
          }))
        )}. Based on the user's symptoms, return ONLY a valid JSON array of 1-3 best matching doctor objects. Include id, specialist, name, image, and voice fields. No explanation, no markdown, just raw JSON array.`,
      },
      {
        role: "user",
        content: `My symptoms: ${symptoms}`,
      },
    ]);

    let cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const doctors = JSON.parse(cleanJson);

    // Enrich with full agentPrompt from our data
    const enriched = doctors.map((d) => {
      const full = allDoctors.find((a) => a._id.toString() === d.id?.toString());
      return full ? full.toObject() : d;
    });

    res.json(enriched);
  } catch (err) {
    console.error("Suggest Doctors Error:", err);
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

// POST /api/ai/chat
router.post("/chat", verifyToken, async (req, res) => {
  const { messages, agentPrompt } = req.body;

  if (!messages || !agentPrompt)
    return res.status(400).json({ message: "Messages and agentPrompt are required" });

  try {
    let patientContext = "";
    if (req.user) {
      const { name, age, height, weight, gender, medicalHistory } = req.user;
      patientContext = `\n\n[Patient Context]\nName: ${name || "Unknown"}\nAge: ${age ? age + " years" : "Not provided"}\nHeight: ${height ? height + " cm" : "Not provided"}\nWeight: ${weight ? weight + " kg" : "Not provided"}\nGender: ${gender || "Not provided"}\nMedical History: ${medicalHistory || "None declared"}`;
    }

    const specialtyGuardRule = `\n\n[STRICT MEDICAL SCOPE RULES]\n` +
      `1. You are strictly authorized to answer questions, diagnose, or give advice ONLY related to your exact medical specialty/niche specified in your prompt.\n` +
      `2. If the patient asks about other diseases, symptoms, medications, or health concerns outside your specific specialty, you MUST decline to consult on it.\n` +
      `3. You may offer a very short, generic high-level comment (maximum 1 sentence), but you must immediately refuse to give diagnoses or details on out-of-scope conditions, and politely instruct the patient to consult the correct specialist from our system instead.`;

    const reply = await askAi([
      { role: "system", content: agentPrompt + patientContext + specialtyGuardRule },
      ...messages,
    ]);

    res.json({ reply });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: "AI error", error: err.message });
  }
});

// POST /api/ai/generate-report
router.post("/generate-report", verifyToken, async (req, res) => {
  const { messages, doctorName, specialist, symptoms } = req.body;

  try {
    let patientDetailsPrompt = "";
    if (req.user) {
      const { name, age, height, weight, gender, medicalHistory } = req.user;
      patientDetailsPrompt = `\nPatient Details:\nName: ${name || "Unknown"}\nAge: ${age || "N/A"}\nHeight: ${height ? height + "cm" : "N/A"}\nWeight: ${weight ? weight + "kg" : "N/A"}\nGender: ${gender || "N/A"}\nMedical History: ${medicalHistory || "None"}\n`;
    }

    const conversation = messages
      .map((m) => `${m.role === "user" ? "Patient" : doctorName}: ${m.content}`)
      .join("\n");

    // Check if the user had a substantial conversation
    const userTextJoined = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" ")
      .trim();

    let silenceInstructions = "";
    if (userTextJoined.length < 8) {
      silenceInstructions = "\n\nCRITICAL SAFETY NOTICE: The patient disconnected without describing symptoms or having an active conversation (silent or only greetings). Therefore, no diagnostic context is available. You MUST return an empty array [] for the 'recommendedMedicines' field. Do not recommend or suggest any medications. Keep the advice general and supportive.";
    }

    const raw = await askAi([
      {
        role: "system",
        content:
          "You are an expert clinical documentation assistant. Your job is to analyze the conversation between the AI medical specialist and the patient, along with patient clinical metadata, and generate a comprehensive, highly structured, and professional diagnostic report.\n\nYou must return a valid JSON object containing exactly these fields (do not use markdown formatting inside values):\n- summary (string): A comprehensive clinical summary of the consultation. Detail the chief complaint, duration of symptoms, relevant clinical history, patient's vital/physical metadata (if provided), and the overall progression of the conversation. Maintain a professional, objective medical tone.\n- conditions (array of strings): List of identified potential diagnoses, suspected conditions, or differential diagnoses. Use standard clinical terminology. State the certainty level (e.g., 'Suspected Acute Bronchitis', 'Likely Tension Headache').\n- advice (array of strings): Practical, non-pharmacological advice, lifestyle changes, dietary recommendations, home remedies, and wellness precautions tailored to the patient's condition.\n- recommendedMedicines (array of strings): A detailed list of recommended medications. You MUST extract all medications discussed by the doctor. If none were explicitly prescribed but the condition warrants supportive care, suggest standard, safe over-the-counter medications (e.g., 'Paracetamol 650mg - 1 tablet every 6 hours as needed for fever (Max 4g/day)', 'Saline Nasal Spray - 2 sprays per nostril 3 times daily for congestion'). Include active ingredients, clear dosage instructions, frequency, and duration of use. Do not leave this empty if supportive pharmacotherapy is standard practice." +
          silenceInstructions +
          "\n- followUp (string): Specific follow-up timeline (e.g., 'Consult back if symptoms persist for more than 3 days') and critical red-flag warnings requiring immediate emergency medical attention (e.g., difficulty breathing, chest pain, high fever).\n\nReturn only valid, parseable JSON. Do not include markdown code block tags, explanations, or any text other than the raw JSON object.",
      },
      {
        role: "user",
        content: `Doctor: ${doctorName} (${specialist})\nPatient Symptoms: ${symptoms}\n${patientDetailsPrompt}\nConversation:\n${conversation}`,
      },
    ]);

    let cleanJson = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const report = JSON.parse(cleanJson);

    res.json(report);
  } catch (err) {
    console.error("Generate Report Error:", err);
    res.status(500).json({ message: "Report generation failed", error: err.message });
  }
});

// POST /api/ai/tts
router.post("/tts", verifyToken, async (req, res) => {
  const { text, voice } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });

  try {
    const edgeTTS = new EdgeTTS({
      voice: voice || "en-US-AriaNeural",
      lang: "en-US",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    });

    const filePath = path.join(process.cwd(), `${uuidv4()}.mp3`);
    await edgeTTS.ttsPromise(text, filePath);

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": stat.size,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    readStream.on("end", () => fs.unlinkSync(filePath));
  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ message: "TTS generation failed", error: err.message });
  }
});

// GET /api/ai/tts (for low-latency direct streaming)
router.get("/tts", verifyToken, async (req, res) => {
  const { text, voice } = req.query;

  if (!text) return res.status(400).json({ message: "Text is required" });

  try {
    const edgeTTS = new EdgeTTS({
      voice: voice || "en-US-AriaNeural",
      lang: "en-US",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
    });

    const filePath = path.join(process.cwd(), `${uuidv4()}.mp3`);
    await edgeTTS.ttsPromise(text, filePath);

    const stat = fs.statSync(filePath);
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": stat.size,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
    readStream.on("end", () => fs.unlinkSync(filePath));
  } catch (err) {
    console.error("TTS GET Error:", err);
    res.status(500).json({ message: "TTS generation failed", error: err.message });
  }
});

export default router;
