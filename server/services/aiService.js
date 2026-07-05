const axios = require("axios");

const PROVIDER = process.env.AI_PROVIDER || "groq";

/**
 * Calls the configured LLM provider with a system + user prompt and
 * returns the raw text response.
 */
async function callLLM(systemPrompt, userPrompt) {
  if (PROVIDER === "gemini") {
    return callGemini(systemPrompt, userPrompt);
  }
  return callGroq(systemPrompt, userPrompt);
}

// ---- Groq (free, OpenAI-compatible, very fast Llama 3.3 70B) ----
// Get a free key at https://console.groq.com/keys
async function callGroq(systemPrompt, userPrompt) {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.choices[0].message.content;
}

// ---- Google Gemini free tier ----
// Get a free key at https://aistudio.google.com/app/apikey
async function callGemini(systemPrompt, userPrompt) {
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const res = await axios.post(url, {
    contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
  });
  return res.data.candidates[0].content.parts[0].text;
}

/** Strip ```json fences and parse safely */
function safeParseJSON(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {}
    }
    throw new Error("AI response was not valid JSON: " + cleaned.slice(0, 200));
  }
}

async function generateQuestion({ type, role, skills, difficulty, history }) {
  const systemPrompt =
    type === "HR"
      ? `You are an experienced HR Manager conducting a behavioral interview. Ask one thoughtful question at a time about communication, leadership, teamwork, or problem solving. Never reveal answers. Keep questions concise (max 2 sentences).`
      : `You are a senior technical interviewer for a ${role} position. Ask one technical question at a time covering: ${skills.join(
          ", "
        )}. Difficulty: ${difficulty}. Never reveal answers. Keep questions concise (max 2 sentences).`;

  const historyText = history
    .map((h, i) => `Q${i + 1}: ${h.question}\nCandidate: ${h.answer}`)
    .join("\n\n");

  const userPrompt = history.length
    ? `Interview so far:\n${historyText}\n\nBased on the candidate's previous answers, ask the next question. Return ONLY the question text, nothing else.`
    : `Ask the very first interview question for a ${role} candidate. Return ONLY the question text, nothing else.`;

  const text = await callLLM(systemPrompt, userPrompt);
  return text.trim().replace(/^["']|["']$/g, "");
}

async function evaluateAnswer({ type, role, question, answer }) {
  const systemPrompt = `You are an expert ${type === "HR" ? "HR" : "technical"} interviewer evaluating a candidate for the role of ${role}. Respond ONLY with strict JSON, no markdown, no preamble.`;

  const userPrompt = `Question: ${question}
Candidate Answer: ${answer}

Evaluate the answer and return ONLY this JSON object:
{
  "score": <number 0-10>,
  "feedback": "<one short actionable sentence>",
  "strength": "<one short phrase>",
  "improvement": "<one short phrase>"
}`;

  const text = await callLLM(systemPrompt, userPrompt);
  return safeParseJSON(text);
}

async function generateFinalReport({ type, role, responses }) {
  const systemPrompt = `You are an expert interview panel summarizing a candidate's full interview performance. Respond ONLY with strict JSON, no markdown.`;

  const transcript = responses
    .map(
      (r, i) =>
        `Q${i + 1}: ${r.question}\nAnswer: ${r.answer}\nScore: ${r.score}/10`
    )
    .join("\n\n");

  const userPrompt = `Interview type: ${type}
Role: ${role}
Transcript:
${transcript}

Return ONLY this JSON object:
{
  "overallScore": <number 0-100>,
  "technical": <number 0-100>,
  "communication": <number 0-100>,
  "confidence": <number 0-100>,
  "problemSolving": <number 0-100>,
  "recommendation": "<one short sentence recommendation>"
}`;

  const text = await callLLM(systemPrompt, userPrompt);
  return safeParseJSON(text);
}

module.exports = { generateQuestion, evaluateAnswer, generateFinalReport };
