import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginRegister from "./pages/LoginRegister";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import MilestoneChain from "./pages/MilestoneChain";
import ProtectedRoute from "./ProtectedRoute";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginRegister />} />

        <Route
          path="/client-dashboard"
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/freelancer-dashboard"
          element={
            <ProtectedRoute allowedRole="freelancer">
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/milestones/:projectId"
          element={
            <ProtectedRoute>
              <MilestoneChain />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
