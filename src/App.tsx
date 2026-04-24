/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import SeekerDashboard from "./pages/SeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import PublicProfile from "./pages/PublicProfile";
import CompanyProfile from "./pages/CompanyProfile";
import Navbar from "./components/Navbar";
import { safeJsonParse } from "./lib/utils";
import { AnimatePresence, motion } from "motion/react";

const OrbitalBackground = lazy(() => import("./components/OrbitalBackground"));

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

  if (loading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-6">
        <div className="section-shell rounded-[2rem] px-8 py-6 text-center">
          <div className="eyebrow mb-2">ApplyIQ</div>
          <div className="text-sm font-semibold text-[var(--app-text-muted)]">Loading workspace…</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-shell min-h-screen font-sans text-[var(--app-text)]">
        <div className="orbital-layer" aria-hidden="true">
          <Suspense fallback={null}>
            <OrbitalBackground />
          </Suspense>
        </div>
        <Navbar user={user} onLogout={logout} />
        <AnimatedRoutes user={user} onLogin={login} />
      </div>
    </Router>
  );
}

function AnimatedRoutes({ user, onLogin }: { user: User; onLogin: (user: User) => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(10px)" }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage onLogin={onLogin} />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />
          <Route path="/company/:id" element={<CompanyProfile />} />
          <Route
            path="/dashboard/*"
            element={
              user ? (
                user.role === "SEEKER" ? (
                  <SeekerDashboard user={user} />
                ) : (
                  <RecruiterDashboard user={user} />
                )
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
