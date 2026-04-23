import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../App";
import { motion } from "motion/react";
import { Loader2, ArrowRight, Briefcase, User as UserIcon } from "lucide-react";

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"SEEKER" | "RECRUITER">("SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      onLogin(data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-[calc(100vh-80px)] px-6 py-10">
      <div className="mx-auto grid max-w-6xl items-stretch gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className="gradient-surface hidden rounded-[2.5rem] p-10 lg:flex lg:flex-col lg:justify-between"
        >
          <div>
            <div className="eyebrow">ApplyIQ Workspace</div>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-[var(--app-text)]">
              The elegant way to manage modern hiring momentum.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-[var(--app-text-muted)]">
              Premium light-theme surfaces, intelligent matching, and calmer workflows for both sides of the hiring journey.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Instruction-aware AI cover letters before you apply",
              "Recruiter analytics with views, applicants, and live status history",
              "Luxury visual hierarchy built for trust and readability",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-sm">
                <div className="mt-1 rounded-full bg-[rgba(93,107,255,0.1)] p-2 text-[var(--app-accent)]">
                  <ArrowRight size={14} />
                </div>
                <p className="text-sm leading-7 text-[var(--app-text)]">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-surface-strong mx-auto w-full max-w-xl rounded-[2.5rem] p-8 md:p-10"
        >
          <div className="mb-8">
            <div className="eyebrow">{isLogin ? "Welcome back" : "Create your workspace"}</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--app-text)]">
              {isLogin ? "Sign in to continue" : "Open an ApplyIQ account"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--app-text-muted)]">
              {isLogin
                ? "Enter your credentials to access your premium hiring dashboard."
                : "Choose the experience that fits your role and start with a cleaner product workflow."}
            </p>
          </div>

          {!isLogin && (
            <div className="panel-muted mb-8 flex gap-2 rounded-[1.4rem] p-1.5">
              <button
                onClick={() => setRole("SEEKER")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all ${
                  role === "SEEKER"
                    ? "nav-link-luxury-active"
                    : "nav-link-luxury"
                }`}
              >
                <UserIcon size={16} /> Job Seeker
              </button>
              <button
                onClick={() => setRole("RECRUITER")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all ${
                  role === "RECRUITER"
                    ? "nav-link-luxury-active"
                    : "nav-link-luxury"
                }`}
              >
                <Briefcase size={16} /> Recruiter
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 ml-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3.5 text-sm text-[var(--app-text)] transition-all"
                placeholder="alex@example.com"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3.5 text-sm text-[var(--app-text)] transition-all"
                placeholder="At least 8 characters"
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <button
              disabled={loading}
              className="button-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : isLogin ? "Login" : "Create Account"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
