import React from "react";

export default function ScoreRing({ score = 0, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#5fa88c" : score >= 50 ? "#c9a227" : "#e2725b";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#223438"
        strokeWidth="14"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth="14"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="36"
        fill="#f1ede4"
      >
        {score}
      </text>
      <text
        x="50%"
        y="62%"
        textAnchor="middle"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="12"
        fill="#9fb0ae"
      >
        OVERALL
      </text>
    </svg>
  );
}
