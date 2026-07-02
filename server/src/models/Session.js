import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      id: Number,
      name: String,
      specialist: String,
      image: String,
      agentPrompt: String,
      voice: String,
    },
    symptoms: {
      type: String,
      required: true,
    },
    messages: [messageSchema],
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
    report: {
      summary: String,
      conditions: [String],
      advice: [String],
      recommendedMedicines: [String],
      followUp: String,
      generatedAt: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
