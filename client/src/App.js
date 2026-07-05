import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewRoom from "./pages/InterviewRoom";
import Report from "./pages/Report";
import History from "./pages/History";

function PublicHome() {
  return (
    <div>
      <Navbar />
      <Landing />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <div className="app-main">
            <Routes>
              <Route path="/" element={<PublicHome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/setup/:type" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
              <Route path="/interview/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
              <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
