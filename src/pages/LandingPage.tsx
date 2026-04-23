import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const featureRows = [
  {
    title: "AI-guided resume refinement",
    description: "Extracts signal from real resume content, surfaces skill gaps, and turns vague profiles into credible applications.",
    icon: <Sparkles size={18} />,
  },
  {
    title: "Match scoring with context",
    description: "Every recommendation blends profile depth, role fit, and job description signals instead of simple keyword matching.",
    icon: <Compass size={18} />,
  },
  {
    title: "Hiring analytics recruiters trust",
    description: "Views, applicants, recent pipeline activity, and status history stay visible without cluttering the workspace.",
    icon: <TrendingUp size={18} />,
  },
];

export default function LandingPage() {
  return (
    <div className="app-shell flex flex-col">
      <section className="px-6 pb-18 pt-10 md:pb-24">
        <div className="gradient-surface mx-auto grid max-w-7xl overflow-hidden rounded-[2.75rem] border px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--app-text-soft)] shadow-sm">
                <Zap size={14} className="text-[var(--app-accent)]" />
                Luxury Light Theme Redesign
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-[var(--app-text)] md:text-7xl lg:text-[5.6rem] lg:leading-[0.94]">
                Career intelligence with a clearer, calmer point of view.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--app-text-muted)] md:text-xl">
                ApplyIQ helps candidates present sharper applications and gives recruiters a brighter, more trustworthy workspace for evaluating fit.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/auth"
                className="button-primary inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold transition-all"
              >
                Start with ApplyIQ <ArrowRight size={18} />
              </Link>
              <a
                href="#system"
                className="button-secondary inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold transition-all"
              >
                Explore the system
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <MetricCard value="84%" label="Average match confidence" />
              <MetricCard value="2.3x" label="Faster shortlist review" />
              <MetricCard value="10k+" label="Profiles analyzed" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-10 lg:mt-0"
          >
            <div className="panel-surface-strong relative overflow-hidden rounded-[2.4rem] p-5 md:p-6">
              <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[rgba(163,140,247,0.18)] blur-3xl" />
              <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[rgba(93,107,255,0.16)] blur-3xl" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/78 p-4 shadow-sm">
                  <div>
                    <div className="eyebrow">Selected Opportunity</div>
                    <div className="mt-2 text-xl font-semibold tracking-tight">Senior Product Engineer</div>
                    <div className="mt-1 text-sm text-[var(--app-text-muted)]">Lattice Studio • Remote</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-[rgba(93,107,255,0.1)] px-4 py-3 text-right">
                    <div className="text-2xl font-semibold text-[var(--app-accent)]">94%</div>
                    <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--app-text-soft)]">AI Match</div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_0.86fr]">
                  <div className="panel-muted rounded-[1.8rem] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <div className="eyebrow">Cover Letter Refinement</div>
                        <div className="mt-2 text-lg font-semibold">Instruction-aware drafting</div>
                      </div>
                      <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--app-accent)]">
                        Guided
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl bg-white/80 p-4 text-sm leading-7 text-[var(--app-text-muted)] shadow-sm">
                        “Highlight API design ownership, platform reliability, and my collaboration with data teams.”
                      </div>
                      <div className="rounded-2xl border border-dashed border-[rgba(93,107,255,0.18)] bg-[rgba(255,255,255,0.62)] p-4 text-sm leading-7 text-[var(--app-text)]">
                        The generated draft now reflects product thinking, technical depth, and the candidate’s requested emphasis.
                      </div>
                    </div>
                  </div>

                  <div className="panel-muted rounded-[1.8rem] p-5">
                    <div className="eyebrow">Pipeline Snapshot</div>
                    <div className="mt-2 text-lg font-semibold">Status history stays visible</div>
                    <div className="mt-5 space-y-3">
                      {[
                        ["Applied", "Today · 09:20"],
                        ["Viewed by recruiter", "Today · 11:15"],
                        ["Shortlisted", "Today · 12:40"],
                      ].map(([label, meta]) => (
                        <div key={label} className="flex gap-3">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--app-accent)]" />
                          <div>
                            <div className="text-sm font-semibold text-[var(--app-text)]">{label}</div>
                            <div className="text-xs text-[var(--app-text-soft)]">{meta}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <MiniPanel title="Resume health" value="92" suffix="/100" />
                  <MiniPanel title="Views this week" value="128" />
                  <MiniPanel title="Qualified applicants" value="17" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="system" className="px-6 py-6 md:py-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-4">
            <div className="eyebrow">System-first product design</div>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[var(--app-text)] md:text-5xl">
              Built around clarity, not dashboards for their own sake.
            </h2>
            <p className="max-w-xl text-base leading-8 text-[var(--app-text-muted)]">
              Every surface is lighter, softer, and more structured. Gradients appear only where they create emphasis, not where they compete with information.
            </p>
          </div>

          <div className="grid gap-4">
            {featureRows.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="panel-surface grid gap-4 rounded-[2rem] p-6 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(93,107,255,0.1)] text-[var(--app-accent)]">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--app-text)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-text-muted)]">{feature.description}</p>
                </div>
                <div className="text-sm font-semibold text-[var(--app-text-soft)]">0{index + 1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <AudiencePanel
            eyebrow="For candidates"
            title="A brighter path from resume upload to confident application."
            description="From AI scoring to instructed cover letters and application history, the candidate experience stays readable and calm."
            points={[
              "Resume parsing with actionable improvement prompts",
              "Regenerable AI match scoring per selected role",
              "Tracked status updates with visible history over time",
            ]}
          />
          <AudiencePanel
            eyebrow="For recruiters"
            title="Luxury polish without losing the operational edge."
            description="Recruiter tools now surface views, applicants, and candidate progress inside cleaner, easier-to-scan analytics panels."
            points={[
              "Job listing analytics for views and application volume",
              "Recent pipeline activity with AI fit context",
              "Recruiter actions framed in softer, premium surfaces",
            ]}
            accent="secondary"
          />
        </div>
      </section>

      <section className="px-6 pb-16 md:pb-24">
        <div className="gradient-surface mx-auto max-w-7xl rounded-[2.5rem] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="eyebrow">Final invitation</div>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[var(--app-text)] md:text-5xl">
                Premium, light, trustworthy by default.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
                ApplyIQ now feels less like a generic AI dashboard and more like a deliberate product for career progress and recruiter decision-making.
              </p>
            </div>
            <Link
              to="/auth"
              className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all"
            >
              Enter the workspace <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-pill rounded-[1.6rem] px-5 py-4">
      <div className="text-2xl font-semibold tracking-tight text-[var(--app-text)]">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-[var(--app-text-soft)]">{label}</div>
    </div>
  );
}

function MiniPanel({
  title,
  value,
  suffix,
}: {
  title: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/80 bg-white/72 p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--app-text-soft)]">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-text)]">
        {value}
        {suffix ? <span className="text-base text-[var(--app-text-soft)]">{suffix}</span> : null}
      </div>
    </div>
  );
}

function AudiencePanel({
  eyebrow,
  title,
  description,
  points,
  accent = "primary",
}: {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  accent?: "primary" | "secondary";
}) {
  const accentClass =
    accent === "secondary"
      ? "bg-[linear-gradient(135deg,rgba(163,140,247,0.12),rgba(93,107,255,0.05))]"
      : "bg-[linear-gradient(135deg,rgba(93,107,255,0.1),rgba(163,140,247,0.08))]";

  return (
    <div className={`panel-surface rounded-[2.25rem] p-8 ${accentClass}`}>
      <div className="eyebrow">{eyebrow}</div>
      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--app-text)]">{title}</h3>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--app-text-muted)]">{description}</p>
      <div className="mt-8 space-y-4">
        {points.map((point) => (
          <div key={point} className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/88 text-[var(--app-accent)] shadow-sm">
              <CheckCircle2 size={14} />
            </div>
            <p className="text-sm leading-7 text-[var(--app-text)]">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
