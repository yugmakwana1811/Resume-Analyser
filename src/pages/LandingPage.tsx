import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Layers3,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const principles = [
  {
    title: "Sharper Candidate Signal",
    description:
      "Turn resumes, projects, and context into application material that reads like a confident operator, not a keyword dump.",
    icon: <Sparkles size={18} aria-hidden="true" />,
  },
  {
    title: "Evidence-Led Matching",
    description:
      "Fit scores stay explainable, regenerable, and grounded in the role description instead of black-box decoration.",
    icon: <Compass size={18} aria-hidden="true" />,
  },
  {
    title: "Recruiter Clarity",
    description:
      "Views, applicants, and pipeline changes surface in one calm workspace built for fast decisions.",
    icon: <TrendingUp size={18} aria-hidden="true" />,
  },
];

const productSignals = [
  { label: "Profile Health", value: "92/100" },
  { label: "Live Role Fit", value: "94%" },
  { label: "Pipeline Updates", value: "Real time" },
];

export default function LandingPage() {
  return (
    <div className="app-shell">
      <section className="px-4 pb-16 pt-6 md:px-6 md:pb-24 md:pt-10">
        <div className="page-frame">
          <div className="page-hero grid gap-12 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:px-14 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="relative z-10 flex flex-col justify-between"
            >
              <div>
                <div className="status-chip mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
                  <Zap size={14} className="text-[var(--app-accent)]" aria-hidden="true" />
                  ApplyIQ
                </div>
                <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.07em] text-[var(--app-text)] md:text-7xl lg:text-[5.5rem] lg:leading-[0.92]">
                  Career intelligence that feels precise, calm, and unmistakably premium.
                </h1>
                <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-[var(--app-text-muted)] md:text-xl">
                  Help candidates submit stronger applications and give recruiters a faster path from signal to shortlist without turning the product into a noisy AI dashboard.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/auth"
                  className="button-primary inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold"
                >
                  Open the Workspace <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a
                  href="#product"
                  className="button-secondary inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold"
                >
                  See the Product System
                </a>
              </div>

              <div className="mt-12 grid gap-3 sm:grid-cols-3">
                {productSignals.map((signal) => (
                  <div key={signal.label} className="workspace-stat px-5 py-4">
                    <div className="text-2xl font-semibold tracking-tight text-[var(--app-text)]">
                      {signal.value}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                      {signal.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="relative"
            >
              <div className="panel-surface-strong relative overflow-hidden rounded-[2.3rem] p-5 md:p-6">
                <div className="absolute -left-8 -top-10 h-40 w-40 rounded-full bg-[rgba(139,120,247,0.18)] blur-3xl" />
                <div className="absolute -bottom-10 right-0 h-48 w-48 rounded-full bg-[rgba(70,102,255,0.18)] blur-3xl" />

                <div className="relative z-10 space-y-4">
                  <div className="list-row p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="eyebrow">Selected Role</div>
                        <div className="mt-2 text-xl font-semibold tracking-tight">
                          Senior Product Engineer
                        </div>
                        <div className="mt-1 text-sm text-[var(--app-text-muted)]">
                          Northstar Studio • Remote • Platform & AI Systems
                        </div>
                      </div>
                      <div className="rounded-[1.3rem] bg-[rgba(70,102,255,0.08)] px-4 py-3 text-right">
                        <div className="text-2xl font-semibold text-[var(--app-accent)]">94%</div>
                        <div className="mono mt-1 text-[11px] uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
                          AI Match
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
                    <div className="panel-muted rounded-[1.75rem] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="eyebrow">Cover Letter Input</div>
                          <div className="mt-2 text-lg font-semibold">Instruction-aware drafting</div>
                        </div>
                        <div className="status-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                          Guided
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-[1.35rem] bg-white/82 p-4 text-sm leading-7 text-[var(--app-text-muted)]">
                          “Emphasize systems reliability, API design, and my cross-functional work with data and product.”
                        </div>
                        <div className="rounded-[1.35rem] border border-dashed border-[rgba(70,102,255,0.16)] bg-[rgba(255,255,255,0.62)] p-4 text-sm leading-7 text-[var(--app-text)]">
                          The generated draft keeps the candidate’s actual strengths while tuning tone and emphasis to the selected role.
                        </div>
                      </div>
                    </div>

                    <div className="panel-muted rounded-[1.75rem] p-5">
                      <div className="eyebrow">Application History</div>
                      <div className="mt-2 text-lg font-semibold">Status changes stay visible</div>
                      <div className="mt-5 space-y-4">
                        {[
                          ["Applied", "Today · 09:20"],
                          ["Viewed by recruiter", "Today · 11:15"],
                          ["Shortlisted", "Today · 12:40"],
                        ].map(([label, meta]) => (
                          <div key={label} className="flex items-start gap-3">
                            <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--app-accent)]" />
                            <div>
                              <div className="text-sm font-semibold text-[var(--app-text)]">{label}</div>
                              <div className="mono mt-1 text-[11px] text-[var(--app-text-soft)]">{meta}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <MiniMetric title="Resume Quality" value="92" suffix="/100" />
                    <MiniMetric title="Listing Views" value="128" />
                    <MiniMetric title="Qualified Applicants" value="17" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="product" className="px-4 py-8 md:px-6 md:py-10">
        <div className="page-frame grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="space-y-4">
            <div className="eyebrow">Product Principle</div>
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-[var(--app-text)] md:text-5xl">
              Structure first. Signal first. Styling only where it sharpens trust.
            </h2>
            <p className="max-w-xl text-base leading-8 text-[var(--app-text-muted)]">
              The product is designed to reduce cognitive drag across searching, matching, reviewing, and decision-making. Every panel has one job and every accent earns its place.
            </p>
          </div>

          <div className="grid gap-4">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.42, delay: index * 0.08 }}
                className="section-shell grid gap-4 rounded-[2rem] p-6 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(70,102,255,0.08)] text-[var(--app-accent)]">
                  {principle.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--app-text)]">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-text-muted)]">
                    {principle.description}
                  </p>
                </div>
                <div className="mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
                  0{index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="page-frame grid gap-6 lg:grid-cols-2">
          <AudiencePanel
            eyebrow="For candidates"
            title="A clearer path from resume upload to confident application."
            description="Profile strength, AI match quality, and cover-letter refinement stay connected in one readable flow."
            points={[
              "Resume parsing with improvement guidance",
              "Role-by-role AI fit analysis with regeneration",
              "Application tracking with status history",
            ]}
          />
          <AudiencePanel
            eyebrow="For recruiters"
            title="A faster operating surface for evaluating hiring momentum."
            description="Listing views, applicant volume, and recent pipeline changes remain immediately legible without drowning the recruiter in chrome."
            points={[
              "Views and applicant analytics per listing",
              "Recent pipeline activity with fit context",
              "Softer, higher-trust operational surfaces",
            ]}
            accent="secondary"
          />
        </div>
      </section>

      <section className="px-4 pb-16 md:px-6 md:pb-24">
        <div className="page-frame">
          <div className="page-hero px-8 py-10 md:px-12 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="eyebrow">Ready to start</div>
                <h2 className="mt-3 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.05em] text-[var(--app-text)] md:text-5xl">
                  Make hiring decisions with more signal and less product friction.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
                  ApplyIQ is built for people who want their recruiting tools to feel as disciplined as the decisions they support.
                </p>
              </div>
              <Link
                to="/auth"
                className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-semibold"
              >
                Enter ApplyIQ <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniMetric({
  title,
  value,
  suffix,
}: {
  title: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="workspace-stat px-5 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
        {title}
      </div>
      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-semibold tracking-tight text-[var(--app-text)]">{value}</span>
        {suffix ? <span className="pb-1 text-sm text-[var(--app-text-muted)]">{suffix}</span> : null}
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
  const toneClass =
    accent === "secondary"
      ? "from-[rgba(139,120,247,0.1)] to-[rgba(70,102,255,0.06)]"
      : "from-[rgba(70,102,255,0.1)] to-[rgba(139,120,247,0.06)]";

  return (
    <div
      className={`section-shell rounded-[2.5rem] bg-gradient-to-br ${toneClass} p-8 md:p-10`}
    >
      <div className="eyebrow">{eyebrow}</div>
      <h3 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] text-[var(--app-text)]">
        {title}
      </h3>
      <p className="mt-4 max-w-xl text-sm leading-8 text-[var(--app-text-muted)]">{description}</p>

      <div className="mt-8 space-y-4">
        {points.map((point) => (
          <div key={point} className="list-row flex items-start gap-3 p-4">
            <div className="mt-1 rounded-full bg-[rgba(70,102,255,0.1)] p-1.5 text-[var(--app-accent)]">
              <CheckCircle2 size={14} aria-hidden="true" />
            </div>
            <p className="text-sm leading-7 text-[var(--app-text)]">{point}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
