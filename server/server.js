require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

connectDB();

const clientUrl = (process.env.CLIENT_URL || "").replace(/\/$/, "");
const allowedOrigins = clientUrl
  ? [clientUrl, `${clientUrl}/`, "http://localhost:3000"]
  : "*";

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    name: "AI Mock Interview Agent API",
    status: "ok",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
