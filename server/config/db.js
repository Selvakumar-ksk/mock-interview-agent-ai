const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    global.useMemoryStore = false;
    console.log("MongoDB connected");
  } catch (err) {
    global.useMemoryStore = true;
    console.error("MongoDB connection error:", err.message);
    console.warn("Using temporary in-memory storage so the demo can stay online.");
  }
};

module.exports = connectDB;
