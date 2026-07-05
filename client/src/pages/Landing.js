import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div>
      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="rec-dot" /> Live mock interview, right now
          </div>
          <h1>
            Walk into the real thing <em>already warmed up.</em>
          </h1>
          <p className="lede">
            Panel runs full HR and technical interviews with an AI panelist that
            listens, questions, and scores you the way a real interviewer would —
            then hands you a report you can actually act on.
          </p>
          <div className="hero-actions">
            <Link to="/signup"><button className="btn-primary">Start a mock interview</button></Link>
            <Link to="/login"><button className="btn-secondary">I already have an account</button></Link>
          </div>
        </div>

        <div className="panel-card">
          <div className="rec-row">
            <span className="rec-dot" />
            <span className="rec-label">Listening</span>
          </div>
          <div className="waveform">
            {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
          </div>
          <p className="panel-quote">
            "Explain how you'd design a rate limiter for a public API."
          </p>
        </div>
      </section>

      <div className="strip">
        <div className="strip-item"><b>Voice or text</b><br/>Web Speech API</div>
        <div className="strip-item"><b>HR + Technical</b><br/>Role-specific question banks</div>
        <div className="strip-item"><b>Instant scoring</b><br/>Per-answer AI evaluation</div>
        <div className="strip-item"><b>Full report</b><br/>Communication, confidence, depth</div>
      </div>
    </div>
  );
}
