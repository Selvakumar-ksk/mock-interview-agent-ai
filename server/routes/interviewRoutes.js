const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  startInterview,
  submitAnswer,
  finishInterview,
  getHistory,
  getInterview,
  getStats,
} = require("../controllers/interviewController");

router.use(protect);
router.post("/start", startInterview);
router.post("/:id/answer", submitAnswer);
router.post("/:id/finish", finishInterview);
router.get("/history", getHistory);
router.get("/stats", getStats);
router.get("/:id", getInterview);

module.exports = router;
