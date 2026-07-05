const users = [];
const interviews = [];

const makeId = () => `${Date.now()}${Math.random().toString(16).slice(2)}`;
const isMemoryMode = () => global.useMemoryStore === true;

const createUser = (data) => {
  const now = new Date();
  const user = {
    _id: makeId(),
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  return user;
};

const findUserByEmail = (email) =>
  users.find((user) => user.email === email.toLowerCase()) || null;

const findUserById = (id) => {
  const user = users.find((item) => item._id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const createInterview = (data) => {
  const now = new Date();
  const interview = {
    _id: makeId(),
    user: data.user,
    type: data.type,
    role: data.role,
    skills: data.skills || [],
    experience: data.experience || "",
    difficulty: data.difficulty || "Intermediate",
    duration: data.duration || 15,
    responses: [],
    status: "in-progress",
    overallScore: 0,
    breakdown: {
      technical: 0,
      communication: 0,
      confidence: 0,
      problemSolving: 0,
    },
    recommendation: "",
    createdAt: now,
    updatedAt: now,
  };
  interviews.push(interview);
  return interview;
};

const findInterview = (id, userId) =>
  interviews.find((item) => item._id === id && item.user === userId) || null;

const saveInterview = (interview) => {
  interview.updatedAt = new Date();
  return interview;
};

const getHistory = (userId) =>
  interviews
    .filter((item) => item.user === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const getCompleted = (userId) =>
  interviews.filter((item) => item.user === userId && item.status === "completed");

module.exports = {
  isMemoryMode,
  createUser,
  findUserByEmail,
  findUserById,
  createInterview,
  findInterview,
  saveInterview,
  getHistory,
  getCompleted,
};
