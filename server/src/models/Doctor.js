import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    specialist: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    voice: {
      type: String,
      default: "en-US-AriaNeural",
    },
    agentPrompt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
