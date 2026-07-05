const Interview = require("../models/Interview");
const { generateQuestion, evaluateAnswer, generateFinalReport } = require("../services/aiService");
const memoryStore = require("../utils/memoryStore");

// POST /api/interview/start
exports.startInterview = async (req, res) => {
  try {
    const { type, role, skills = [], experience, difficulty, duration } = req.body;
    if (!type || !role) {
      return res.status(400).json({ message: "type and role are required" });
    }
    const interview = memoryStore.isMemoryMode()
      ? memoryStore.createInterview({
          user: req.userId,
          type,
          role,
          skills,
          experience,
          difficulty,
          duration,
        })
      : await Interview.create({
          user: req.userId,
          type,
          role,
          skills,
          experience,
          difficulty,
          duration,
        });

    const question = await generateQuestion({ type, role, skills, difficulty, history: [] });

    res.status(201).json({ interviewId: interview._id, question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/interview/:id/answer
exports.submitAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const interview = memoryStore.isMemoryMode()
      ? memoryStore.findInterview(req.params.id, req.userId)
      : await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const evaluation = await evaluateAnswer({
      type: interview.type,
      role: interview.role,
      question,
      answer,
    });

    interview.responses.push({
      question,
      answer,
      feedback: evaluation.feedback,
      strength: evaluation.strength,
      improvement: evaluation.improvement,
      score: evaluation.score,
    });
    if (memoryStore.isMemoryMode()) {
      memoryStore.saveInterview(interview);
    } else {
      await interview.save();
    }

    let nextQuestion = null;
    if (interview.responses.length < 8) {
      nextQuestion = await generateQuestion({
        type: interview.type,
        role: interview.role,
        skills: interview.skills,
        difficulty: interview.difficulty,
        history: interview.responses.map((r) => ({ question: r.question, answer: r.answer })),
      });
    }

    res.json({ evaluation, nextQuestion, questionCount: interview.responses.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/interview/:id/finish
exports.finishInterview = async (req, res) => {
  try {
    const interview = memoryStore.isMemoryMode()
      ? memoryStore.findInterview(req.params.id, req.userId)
      : await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (!interview.responses.length) {
      return res.status(400).json({ message: "No responses recorded yet" });
    }

    const report = await generateFinalReport({
      type: interview.type,
      role: interview.role,
      responses: interview.responses,
    });

    interview.status = "completed";
    interview.overallScore = report.overallScore;
    interview.breakdown = {
      technical: report.technical,
      communication: report.communication,
      confidence: report.confidence,
      problemSolving: report.problemSolving,
    };
    interview.recommendation = report.recommendation;
    if (memoryStore.isMemoryMode()) {
      memoryStore.saveInterview(interview);
    } else {
      await interview.save();
    }

    res.json({ interview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/interview/history
exports.getHistory = async (req, res) => {
  const interviews = memoryStore.isMemoryMode()
    ? memoryStore.getHistory(req.userId)
    : await Interview.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(interviews);
};

// GET /api/interview/:id
exports.getInterview = async (req, res) => {
  const interview = memoryStore.isMemoryMode()
    ? memoryStore.findInterview(req.params.id, req.userId)
    : await Interview.findOne({ _id: req.params.id, user: req.userId });
  if (!interview) return res.status(404).json({ message: "Interview not found" });
  res.json(interview);
};

// GET /api/interview/stats
exports.getStats = async (req, res) => {
  const interviews = memoryStore.isMemoryMode()
    ? memoryStore.getCompleted(req.userId)
    : await Interview.find({ user: req.userId, status: "completed" });
  const total = interviews.length;
  const avg = total
    ? Math.round(interviews.reduce((s, i) => s + i.overallScore, 0) / total)
    : 0;
  const hr = interviews.filter((i) => i.type === "HR").length;
  const tech = interviews.filter((i) => i.type === "Technical").length;
  res.json({ total, avg, hr, tech });
};
