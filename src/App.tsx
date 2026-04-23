/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import SeekerDashboard from "./pages/SeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PublicProfile from "./pages/PublicProfile";
import CompanyProfile from "./pages/CompanyProfile";
import Navbar from "./components/Navbar";
import { safeJsonParse } from "./lib/utils";

export type User = {
  id: string;
  email: string;
  role: "SEEKER" | "RECRUITER";
  profileId?: string;
  recruiterId?: string;
} | null;

export default function App() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAuth = async () => {
      const savedUser = safeJsonParse<User>(localStorage.getItem("user"), null);
      if (savedUser) {
        setUser(savedUser);
      }

      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          throw new Error("Session not found");
        }

        const currentUser = await response.json();
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    syncAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error(error);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-sans">Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans">
        <Navbar user={user} onLogout={logout} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage onLogin={login} />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/company/:id" element={<CompanyProfile />} />
          
          <Route 
            path="/dashboard/*" 
            element={
              user ? (
                user.role === "SEEKER" ? <SeekerDashboard user={user} /> : <RecruiterDashboard user={user} />
              ) : (
                <Navigate to="/auth" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}
