# Panel — AI Mock Interview Agent

A full-stack MVP that runs live HR and Technical mock interviews by voice or text,
scores each answer with an LLM, and produces a final performance report.

- **Frontend:** React (Create React App), React Router, Web Speech API for voice
- **Backend:** Node.js + Express, JWT auth, MongoDB (Mongoose)
- **AI:** Groq (free, default) or Google Gemini (free tier) — swappable via `.env`

---

## 1. Free API keys you need

| Service | Free tier | Get a key |
|---|---|---|
| **Groq** (default LLM, Llama 3.3 70B) | Yes — generous free rate limits, no card required | https://console.groq.com/keys |
| **Google Gemini** (alternative LLM) | Yes — free tier via AI Studio | https://aistudio.google.com/app/apikey |
| **MongoDB Atlas** (database) | Yes — free M0 cluster | https://www.mongodb.com/cloud/atlas/register |
| **Web Speech API** (voice in/out) | Built into Chrome/Edge — no key needed | n/a |

You only need **one** of Groq or Gemini. Groq is recommended: it's fast and its
free tier is easy to get approved instantly.

---

## 2. Project structure

```
ai-mock-interview-agent/
├── server/          # Express API
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── models/       # User, Interview
│   ├── controllers/  # auth, interview
│   ├── services/aiService.js   # Groq / Gemini calls + prompts
│   ├── routes/
│   └── server.js
├── client/           # React app
│   └── src/
│       ├── pages/    # Landing, Login, Signup, Dashboard, Setup, Room, Report, History
│       ├── components/
│       ├── context/AuthContext.js
│       └── api/axios.js
├── docker-compose.yml
└── .env.example
```

---

## 3. Local setup (no Docker)

### Backend
```bash
cd server
cp ../.env.example .env      # then fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev                  # http://localhost:5000
```

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm start                    # http://localhost:3000
```

Open http://localhost:3000, sign up, and start a mock interview. Use Chrome or
Edge for the microphone button — that's what supports the Web Speech API.

---

## 4. Docker setup

```bash
cp .env.example .env   # fill in your real values first
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health

---

## 5. How the AI flow works

1. `POST /api/interview/start` — creates an interview record and asks the LLM
   for question #1 (`services/aiService.js › generateQuestion`).
2. `POST /api/interview/:id/answer` — sends the candidate's answer to the LLM
   for scoring (`evaluateAnswer`, returns JSON: score, feedback, strength,
   improvement) and immediately requests the next question.
3. After at least 3 answers, the candidate can end the interview:
   `POST /api/interview/:id/finish` calls `generateFinalReport`, which asks the
   LLM to summarize the whole transcript into an overall score and a
   breakdown across technical depth, communication, confidence, and
   problem-solving.
4. `GET /api/interview/history` and `/api/interview/stats` power the
   dashboard and history page.

All prompts live in `server/services/aiService.js` if you want to tune tone,
add more evaluation dimensions, or switch models.

---

## 6. Swapping or adding AI providers

Set `AI_PROVIDER=groq` or `AI_PROVIDER=gemini` in `.env`. Both are called
through the same `callLLM()` function in `aiService.js`, so adding a third
provider (e.g. OpenAI, local Ollama) just means adding one more `callX()`
function and a branch in `callLLM`.

---

## 7. Bonus features to add if you have extra time

- Resume upload (PDF) → auto-fill role/skills
- Webcam-based engagement monitoring
- Downloadable PDF report (the Report page already supports browser print-to-PDF)
- Email the report on completion
- Leaderboard across users

---

## 8. Notes.

- Passwords are hashed with bcrypt; sessions use JWT (7-day expiry).
- The Web Speech API only runs in the browser (Chrome/Edge); Safari and
  Firefox support is limited — the app falls back to typed answers everywhere.
- This is an MVP built for a short deadline — validate inputs further and add
  rate limiting before using it in production.
  
  
