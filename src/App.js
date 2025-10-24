import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// components
import NavBar from "./components/Navbar";

// pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UmbrellaPage from "./pages/UmbrellaPage";
import UmbrellaLogPage from "./pages/UmbrellaLogPage";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("user 정보 파싱 오류:", e);
        localStorage.removeItem("user");
      }
    }
  }, []);

  return (
    <Router>
      <NavBar user={user} setUser={setUser} />
      <Routes>
        {/* ✅✅✅ 이 부분이 수정되었습니다! ✅✅✅ */}
        <Route path="/" element={<HomePage user={user} setUser={setUser} />} />

        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/umbrella" element={<UmbrellaPage user={user} />} />
        <Route path="/umbrella/logs" element={<UmbrellaLogPage user={user} />} />
      </Routes>
    </Router>
  );
}