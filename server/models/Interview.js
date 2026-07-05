const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    feedback: String,
    strength: String,
    improvement: String,
    score: Number,
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["HR", "Technical"], required: true },
    role: { type: String, required: true },
    skills: [String],
    experience: String,
    difficulty: { type: String, default: "Intermediate" },
    duration: { type: Number, default: 15 },
    responses: [responseSchema],
    status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" },
    overallScore: { type: Number, default: 0 },
    breakdown: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
    },
    recommendation: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
