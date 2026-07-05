import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark" />
        Panel
      </Link>
      {user ? (
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/history">History</Link>
          <button
            className="nav-ghost"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login">Log in</Link>
          <button className="nav-cta" onClick={() => navigate("/signup")}>
            Get started
          </button>
        </div>
      )}
    </div>
  );
}
