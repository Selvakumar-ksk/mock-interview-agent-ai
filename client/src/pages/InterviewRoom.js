import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const MAX_QUESTIONS = 8;

export default function InterviewRoom() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(location.state?.firstQuestion || "Loading your first question…");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Speak the question aloud using the free browser Speech Synthesis API
    if (question && "speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(question);
      utter.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, [question]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition isn't supported in this browser. Try Chrome, or type your answer instead.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setAnswer("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setError("");
    if (listening) recognitionRef.current?.stop();
    try {
      const { data } = await api.post(`/interview/${id}/answer`, { question, answer });
      setLastFeedback(data.evaluation);
      setQuestionCount(data.questionCount);
      setAnswer("");
      if (data.nextQuestion && data.questionCount < MAX_QUESTIONS) {
        setTimeout(() => setQuestion(data.nextQuestion), 900);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not evaluate that answer");
    } finally {
      setSubmitting(false);
    }
  };

  const finishInterview = async () => {
    setFinishing(true);
    try {
      await api.post(`/interview/${id}/finish`);
      navigate(`/report/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate the report");
      setFinishing(false);
    }
  };

  const progressPct = Math.min((questionCount / MAX_QUESTIONS) * 100, 100);

  return (
    <div>
      <Navbar />
      <div className="room-wrap">
        <div className="room-top">
          <span className="room-meta">Question {questionCount + 1} of {MAX_QUESTIONS}</span>
          <span className="room-meta">Panel is listening</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>

        {error && <div className="form-error">{error}</div>}

        <div className="question-card">
          <div className="question-tag">Panel asks</div>
          <div className="question-text">{question}</div>
        </div>

        <div className="answer-box">
          <div className="mic-row">
            <button className={`mic-btn ${listening ? "listening" : ""}`} onClick={toggleMic} type="button">🎙️</button>
            <span className="mic-hint">{listening ? "Listening… tap to stop" : "Tap to speak, or type your answer below"}</span>
          </div>
          <textarea
            className="answer-textarea"
            placeholder="Your answer will appear here as you speak — or just type it."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div className="room-actions">
            {questionCount >= 3 && (
              <button className="btn-secondary" onClick={finishInterview} disabled={finishing}>
                {finishing ? "Building report…" : "End & get report"}
              </button>
            )}
            <button className="btn-primary" onClick={submitAnswer} disabled={submitting || !answer.trim()}>
              {submitting ? "Evaluating…" : "Submit answer"}
            </button>
          </div>

          {lastFeedback && (
            <div className="feedback-toast">
              <div className="feedback-score">{lastFeedback.score}/10</div>
              <div className="feedback-body">
                <p><span className="fb-label">Feedback</span>{lastFeedback.feedback}</p>
                <p><span className="fb-label">Strength</span>{lastFeedback.strength}</p>
                <p><span className="fb-label">Improve</span>{lastFeedback.improvement}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
