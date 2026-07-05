import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/interview/history").then((res) => setInterviews(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        <div className="page-head">
          <div>
            <h2>Interview history</h2>
            <div className="sub">Every session you've run through Panel.</div>
          </div>
        </div>

        {interviews.length === 0 ? (
          <div className="empty-state">Nothing here yet. Start your first interview from the dashboard.</div>
        ) : (
          <div className="history-list">
            {interviews.map((r) => (
              <div
                className="history-row"
                key={r._id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(r.status === "completed" ? `/report/${r._id}` : `/interview/${r._id}`)}
              >
                <span className={`type-badge ${r.type === "HR" ? "badge-hr" : "badge-tech"}`}>{r.type}</span>
                <span className="role-name">{r.role}</span>
                <span className="date">{new Date(r.createdAt).toLocaleDateString()}</span>
                <span className="score">{r.status === "completed" ? `${r.overallScore}%` : "In progress"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
