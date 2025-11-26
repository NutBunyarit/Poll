import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// เราจะสร้างหน้าเปล่าๆ ไว้ทดสอบก่อนครับ
import Dashboard from "./pages/Dashboard"; 
import Poll from "./pages/Poll";
import Vote from "./pages/Vote";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/poll" element={<Poll />} />
      <Route path="/vote" element={<Vote />} />
      
      {/* ถ้าเข้าเว็บมาเปล่าๆ ให้เด้งไป Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;