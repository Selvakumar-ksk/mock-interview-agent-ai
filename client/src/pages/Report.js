import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ScoreRing from "../components/ScoreRing";

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    api.get(`/interview/${id}`).then((res) => setInterview(res.data));
  }, [id]);

  if (!interview) {
    return (
      <div>
        <Navbar />
        <div className="page-wrap">Loading your report…</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        <div className="report-hero">
          <div className="eyebrow"><span className="rec-dot" style={{ background: "#5fa88c" }} /> Interview complete</div>
          <h2>{interview.role} — {interview.type} Interview</h2>
          <div className="score-ring-wrap"><ScoreRing score={interview.overallScore} /></div>
        </div>

        <div className="report-grid">
          <div className="report-metric"><div className="val">{interview.breakdown.technical}%</div><div className="lbl">Technical</div></div>
          <div className="report-metric"><div className="val">{interview.breakdown.communication}%</div><div className="lbl">Communication</div></div>
          <div className="report-metric"><div className="val">{interview.breakdown.confidence}%</div><div className="lbl">Confidence</div></div>
          <div className="report-metric"><div className="val">{interview.breakdown.problemSolving}%</div><div className="lbl">Problem solving</div></div>
        </div>

        <div className="recommendation-card">
          <p>"{interview.recommendation}"</p>
        </div>

        <h3 className="section-title">Full transcript</h3>
        <div className="panel-card" style={{ background: "var(--panel)" }}>
          {interview.responses.map((r, i) => (
            <div className="transcript-item" key={i}>
              <div className="transcript-q">Q{i + 1}. {r.question}</div>
              <div className="transcript-a">{r.answer}</div>
              <div className="transcript-fb">Score {r.score}/10 — {r.feedback}</div>
            </div>
          ))}
        </div>

        <div className="hero-actions" style={{ marginTop: 32 }}>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
          <button className="btn-secondary" onClick={() => window.print()}>Print / save as PDF</button>
        </div>
      </div>
    </div>
  );
}
