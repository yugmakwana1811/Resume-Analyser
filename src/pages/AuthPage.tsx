import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../App";
import { motion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Loader2,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const highlights = [
  "AI match analysis tied to your actual profile and selected job.",
  "Cover-letter drafting with room for instructions, keywords, and tone.",
  "Recruiter analytics, views, applicants, and status history in one system.",
];

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"SEEKER" | "RECRUITER">("SEEKER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      if (!response.ok) throw new Error(data.error || "We couldn’t sign you in.");

      onLogin(data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-[calc(100vh-92px)] px-4 py-6 md:px-6 md:py-8">
      <div className="page-frame grid items-stretch gap-6 lg:grid-cols-[1.03fr_0.97fr]">
        <motion.section
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className="page-hero hidden min-h-[44rem] p-8 lg:flex lg:flex-col lg:justify-between lg:p-10"
        >
          <div>
            <div className="status-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
              <Sparkles size={14} className="text-[var(--app-accent)]" aria-hidden="true" />
              ApplyIQ Access
            </div>
            <h1 className="mt-8 max-w-2xl text-balance text-5xl font-semibold tracking-[-0.06em] text-[var(--app-text)]">
              A more disciplined workspace for career moves and hiring decisions.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--app-text-muted)]">
              Sign in to continue where you left off, or create an account to start building stronger applications and cleaner recruiter workflows.
            </p>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => (
              <div key={item} className="list-row flex items-start gap-3 p-4">
                <div className="mt-1 rounded-full bg-[rgba(70,102,255,0.1)] p-1.5 text-[var(--app-accent)]">
                  <CheckCircle2 size={14} aria-hidden="true" />
                </div>
                <p className="text-sm leading-7 text-[var(--app-text)]">{item}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel-surface-strong mx-auto w-full max-w-xl rounded-[2.5rem] p-6 md:p-8 lg:p-10"
        >
          <div className="mb-8">
            <div className="eyebrow">{isLogin ? "Welcome Back" : "Create Your Account"}</div>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.05em] text-[var(--app-text)]">
              {isLogin ? "Sign in to continue" : "Open your ApplyIQ workspace"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--app-text-muted)]">
              {isLogin
                ? "Use your email and password to return to your dashboard."
                : "Choose the experience that matches your role. You can refine the rest from inside the product."}
            </p>
          </div>

          {!isLogin ? (
            <div className="panel-muted mb-8 grid grid-cols-2 gap-2 rounded-[1.5rem] p-1.5">
              <button
                type="button"
                onClick={() => setRole("SEEKER")}
                className={`flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold ${
                  role === "SEEKER" ? "nav-link-luxury-active" : "nav-link-luxury"
                }`}
              >
                <UserIcon size={16} aria-hidden="true" />
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole("RECRUITER")}
                className={`flex items-center justify-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-semibold ${
                  role === "RECRUITER" ? "nav-link-luxury-active" : "nav-link-luxury"
                }`}
              >
                <Briefcase size={16} aria-hidden="true" />
                Recruiter
              </button>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="auth-email"
                className="mb-2 ml-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3.5 text-sm"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-2 ml-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]"
              >
                Password
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="field-shell w-full rounded-2xl px-4 py-3.5 text-sm"
                placeholder="At least 8 characters…"
              />
            </div>

            {error ? (
              <p
                aria-live="polite"
                className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                {error}
              </p>
            ) : null}

            <button
              disabled={loading}
              className="button-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                  {isLogin ? "Signing In…" : "Creating Account…"}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin((current) => !current)}
              className="button-ghost rounded-full px-4 py-2 font-semibold"
            >
              {isLogin ? "Don’t have an account? Create one" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
