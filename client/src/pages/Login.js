import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-sub">Log in to continue your interview practice.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <div className="auth-switch">
          New to Panel? <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
