const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const memoryStore = require("../utils/memoryStore");

const genToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = memoryStore.isMemoryMode()
      ? memoryStore.findUserByEmail(email)
      : await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = memoryStore.isMemoryMode()
      ? memoryStore.createUser({ name, email, password: hashed })
      : await User.create({ name, email, password: hashed });
    res.status(201).json({
      token: genToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = memoryStore.isMemoryMode()
      ? memoryStore.findUserByEmail(email)
      : await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    res.json({
      token: genToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  const user = memoryStore.isMemoryMode()
    ? memoryStore.findUserById(req.userId)
    : await User.findById(req.userId).select("-password");
  res.json(user);
};
