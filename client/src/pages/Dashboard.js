import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, avg: 0, hr: 0, tech: 0 });
  const [recent, setRecent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/interview/stats").then((res) => setStats(res.data)).catch(() => {});
    api.get("/interview/history").then((res) => setRecent(res.data.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        <div className="page-head">
          <div>
            <h2>Hey {user?.name?.split(" ")[0]}, ready to practice?</h2>
            <div className="sub">Pick an interview type below and Panel will run it end-to-end.</div>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><div className="num">{stats.total}</div><div className="label">Total interviews</div></div>
          <div className="stat-card"><div className="num">{stats.avg}%</div><div className="label">Average score</div></div>
          <div className="stat-card"><div className="num">{stats.hr}</div><div className="label">HR interviews</div></div>
          <div className="stat-card"><div className="num">{stats.tech}</div><div className="label">Technical interviews</div></div>
        </div>

        <div className="choice-grid">
          <div className="choice-card" onClick={() => navigate("/setup/HR")}>
            <div className="choice-tag">Behavioral</div>
            <h3>HR Interview</h3>
            <p>Communication, leadership, teamwork, and problem-solving questions, scored after every answer.</p>
          </div>
          <div className="choice-card" onClick={() => navigate("/setup/Technical")}>
            <div className="choice-tag">Role-specific</div>
            <h3>Technical Interview</h3>
            <p>Questions tailored to your role and skills, at the difficulty level you choose.</p>
          </div>
        </div>

        <h3 className="section-title">Recent activity</h3>
        {recent.length === 0 ? (
          <div className="empty-state">No interviews yet — start one above to see it here.</div>
        ) : (
          <div className="history-list">
            {recent.map((r) => (
              <div className="history-row" key={r._id} onClick={() => navigate(r.status === "completed" ? `/report/${r._id}` : `/interview/${r._id}`)} style={{ cursor: "pointer" }}>
                <span className={`type-badge ${r.type === "HR" ? "badge-hr" : "badge-tech"}`}>{r.type}</span>
                <span className="role-name">{r.role}</span>
                <span className="date">{new Date(r.createdAt).toLocaleDateString()}</span>
                <span className="score">{r.status === "completed" ? `${r.overallScore}%` : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
