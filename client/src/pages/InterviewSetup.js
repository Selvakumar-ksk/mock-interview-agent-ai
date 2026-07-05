import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function InterviewSetup() {
  const { type } = useParams(); // "HR" or "Technical"
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState(15);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/interview/start", {
        type,
        role,
        experience,
        difficulty,
        duration: Number(duration),
        skills,
      });
      navigate(`/interview/${data.interviewId}`, { state: { firstQuestion: data.question } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not start the interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-wrap">
        <div className="setup-card">
          <h2>{type} Interview setup</h2>
          <p className="auth-sub">Tell Panel a little about the role so questions land right.</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Target role</label>
              <input required value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Java Full Stack Developer" />
            </div>

            {type === "Technical" && (
              <div className="field">
                <label>Skills (press Enter to add)</label>
                <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="e.g. Java, Spring Boot, React" />
                <div className="skills-input-hint">Add each skill and press Enter.</div>
                <div className="chips-wrap">
                  {skills.map((s, i) => (
                    <span className="skill-chip" key={i}>{s} <button type="button" onClick={() => removeSkill(i)}>×</button></span>
                  ))}
                </div>
              </div>
            )}

            <div className="two-col">
              <div className="field">
                <label>Experience level</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)}>
                  <option>Fresher</option>
                  <option>1-3 years</option>
                  <option>3-5 years</option>
                  <option>5+ years</option>
                </select>
              </div>
              <div className="field">
                <label>Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Duration (minutes)</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>

            <button className="btn-primary btn-block" disabled={loading}>
              {loading ? "Preparing your interview…" : "Begin interview"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
