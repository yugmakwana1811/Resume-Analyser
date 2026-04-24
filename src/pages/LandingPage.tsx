import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { HeroScrollDemo } from "../components/HeroScrollDemo";
import { HeroDemo } from "../components/HeroDemo";
import { SparklesDemo } from "../components/SparklesDemo";
import { GeometricHeroDemo } from "../components/GeometricHeroDemo";
import { CreativePricingDemo } from "../components/CreativePricingDemo";
import { ProgressIndicatorDemo } from "../components/ProgressIndicatorDemo";
import { RemotionShowcase } from "../components/RemotionShowcase";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Layers3,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const trustCompanies = ["NORTHSTAR", "LUMINA", "ATLAS", "FLOWHQ", "CIRRUS", "ORBIT"];

const pillars = [
  {
    title: "Signal-Native Matching",
    description:
      "AI match scoring stays explainable, fast to regenerate, and anchored to both the role brief and real profile strength.",
    icon: <Compass size={18} aria-hidden="true" />,
  },
  {
    title: "Instruction-Led Cover Letters",
    description:
      "Candidates add keywords, tone, or specific wins before generation so output feels tailored and decision-ready.",
    icon: <Sparkles size={18} aria-hidden="true" />,
  },
  {
    title: "Recruiter Momentum Analytics",
    description:
      "Views, applicants, and application transitions appear in one clean operating layer for faster hiring calls.",
    icon: <TrendingUp size={18} aria-hidden="true" />,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-92px)]">
      <section className="px-4 pb-12 pt-6 md:px-6 md:pb-18 md:pt-10">
        <div className="page-frame">
          <div className="page-hero grid gap-10 px-6 py-8 md:px-10 md:py-11 lg:grid-cols-[1.04fr_0.96fr] lg:px-14 lg:py-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52 }}
            >
              <div className="status-chip mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
                <Zap size={14} className="text-[var(--app-accent)]" />
                Premium Hiring OS
              </div>
              <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.07em] md:text-7xl lg:text-[5.4rem] lg:leading-[0.92]">
                Hiring intelligence that looks refined and works faster.
              </h1>
              <p className="mt-6 max-w-2xl text-balance text-lg leading-8 text-[var(--app-text-muted)] md:text-xl">
                A luxury-light product surface for seekers and recruiters that brings profile strength, role fit, and decision analytics into one disciplined workflow.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button asChild variant="default" size="lg">
                  <Link to="/auth">
                    Open ApplyIQ <ArrowRight size={18} />
                  </Link>
                </Button>
                <a
                  href="#system"
                  className="button-secondary inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold"
                >
                  Explore Design System
                </a>
              </div>
            </motion.div>

	            <motion.div
	              initial={{ opacity: 0, scale: 0.98 }}
	              animate={{ opacity: 1, scale: 1 }}
	              transition={{ duration: 0.62, delay: 0.1 }}
	              className="panel-surface-strong relative overflow-hidden rounded-[2.4rem] p-5 md:p-6"
	            >
	              <div className="absolute -left-8 top-0 h-44 w-44 rounded-full bg-[rgba(47,103,255,0.17)] blur-3xl" />
	              <div className="absolute -bottom-10 right-0 h-56 w-56 rounded-full bg-[rgba(76,185,214,0.16)] blur-3xl" />
	              <svg
	                className="pointer-events-none absolute inset-0 opacity-60"
	                viewBox="0 0 600 600"
	                fill="none"
	                aria-hidden="true"
	              >
	                <path
	                  d="M40 420C126 306 164 328 238 260C314 190 376 174 456 152C520 132 560 86 584 44"
	                  className="motion-stroke"
	                  stroke="url(#g1)"
	                  strokeWidth="2"
	                  strokeLinecap="round"
	                />
	                <path
	                  d="M36 520C140 444 214 432 280 372C362 298 394 250 468 218C532 190 556 144 596 116"
	                  className="motion-stroke motion-stroke-delayed"
	                  stroke="url(#g2)"
	                  strokeWidth="2"
	                  strokeLinecap="round"
	                />
	                <defs>
	                  <linearGradient id="g1" x1="40" y1="420" x2="584" y2="44" gradientUnits="userSpaceOnUse">
	                    <stop stopColor="rgba(47,103,255,0.0)" />
	                    <stop offset="0.35" stopColor="rgba(47,103,255,0.42)" />
	                    <stop offset="1" stopColor="rgba(76,185,214,0.0)" />
	                  </linearGradient>
	                  <linearGradient id="g2" x1="36" y1="520" x2="596" y2="116" gradientUnits="userSpaceOnUse">
	                    <stop stopColor="rgba(76,185,214,0.0)" />
	                    <stop offset="0.4" stopColor="rgba(76,185,214,0.45)" />
	                    <stop offset="1" stopColor="rgba(47,103,255,0.0)" />
	                  </linearGradient>
	                </defs>
	              </svg>
	              <div className="relative z-10 space-y-4">
	                <div className="list-row p-5">
                  <div className="eyebrow mb-2">Live Match Workspace</div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xl font-semibold">Staff Product Engineer</div>
                      <div className="mt-1 text-sm text-[var(--app-text-muted)]">
                        Northstar Studio • Remote • API Platform
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] bg-[rgba(47,103,255,0.1)] px-4 py-3 text-right">
                      <div className="text-2xl font-semibold text-[var(--app-accent)]">94%</div>
                      <div className="mono mt-1 text-[11px] uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                        AI Match
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="panel-muted rounded-[1.6rem] p-4">
                    <div className="eyebrow mb-3">Cover Letter Prompt</div>
                    <p className="rounded-xl bg-white/80 p-3 text-sm leading-7 text-[var(--app-text-muted)]">
                      “Include incident response wins, platform ownership, and cross-functional product work.”
                    </p>
                  </div>
                  <div className="panel-muted rounded-[1.6rem] p-4">
                    <div className="eyebrow mb-3">Status Timeline</div>
                    <div className="space-y-2.5">
                      {["Applied", "Viewed", "Shortlisted"].map((item) => (
                        <div key={item} className="flex items-center gap-2.5 text-sm text-[var(--app-text)]">
                          <span className="h-2 w-2 rounded-full bg-[var(--app-accent)]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 md:px-6 md:pb-10">
        <div className="page-frame section-shell rounded-[2rem] px-5 py-4 md:px-8">
          <div className="eyebrow mb-3">Trusted by product teams and hiring squads</div>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3 lg:grid-cols-6">
            {trustCompanies.map((company) => (
              <div key={company} className="metric-pill rounded-xl px-3 py-3 text-xs font-semibold tracking-[0.2em] text-[var(--app-text-soft)]">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame">
          <div className="page-hero px-6 py-8 md:px-10 md:py-10">
            <HeroDemo />
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame">
          <div className="section-shell rounded-[2.5rem]">
            <HeroScrollDemo />
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame">
          <GeometricHeroDemo />
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame">
          <SparklesDemo />
        </div>
      </section>

      <section id="system" className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="eyebrow mb-3">Design and product system</div>
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Structure-first surfaces with high-clarity depth.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--app-text-muted)]">
              We removed visual noise and built a focused light interface with measured gradients, controlled glass layers, and purposeful interaction polish.
            </p>
          </div>

          <div className="grid gap-4">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="section-shell grid gap-4 rounded-[2rem] p-6 md:grid-cols-[auto_1fr_auto] md:items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(47,103,255,0.1)] text-[var(--app-accent)]">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-text-muted)]">{pillar.description}</p>
                </div>
                <div className="mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--app-text-soft)]">
                  0{index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 pt-4 md:px-6 md:pb-24">
        <div className="page-frame grid gap-6 lg:grid-cols-2">
          <LuxuryPanel
            eyebrow="For Candidates"
            title="Ship stronger applications with cleaner AI support."
            points={[
              "Resume intelligence and profile confidence scoring",
              "Regenerable AI match with rationale",
              "Instruction-aware cover letter drafting",
            ]}
          />
          <LuxuryPanel
            eyebrow="For Recruiters"
            title="Read hiring momentum instantly, without dashboard clutter."
            points={[
              "Views and applicants per job listing",
              "Status history across each application",
              "Fast, high-trust review and filtering flow",
            ]}
            secondary
          />
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame">
          <div className="section-shell rounded-[2.75rem] px-7 py-10 md:px-12 md:py-14">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <div className="eyebrow mb-3">Interaction module</div>
                <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                  Progress that feels alive, but stays controlled.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-[var(--app-text-muted)]">
                  A compact stepper component you can reuse for onboarding, application steps, and recruiter workflows.
                </p>
              </div>
              <div className="panel-surface rounded-[2.25rem] p-8 md:p-10">
                <ProgressIndicatorDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame">
          <div className="page-hero px-6 py-10 md:px-10 md:py-12">
            <div className="eyebrow mb-3">Pricing module</div>
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Component drop-in: creative pricing
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-text-muted)]">
              This is integrated as-is for your component library. It can be re-skinned to match ApplyIQ’s luxury-light system.
            </p>
            <div className="mt-10">
              <CreativePricingDemo />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14">
        <div className="page-frame">
          <div className="page-hero px-6 py-10 md:px-10 md:py-12">
            <div className="eyebrow mb-3">Motion graphics</div>
            <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Remotion scenes embedded inside the product surface.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--app-text-muted)]">
              These demos are powered by `remotion` + `@remotion/player` and can be repurposed for marketing, onboarding, or in-product moments.
            </p>
            <div className="mt-10">
              <RemotionShowcase />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LuxuryPanel({
  eyebrow,
  title,
  points,
  secondary,
}: {
  eyebrow: string;
  title: string;
  points: string[];
  secondary?: boolean;
}) {
  return (
    <div
      className={`section-shell rounded-[2.4rem] p-8 md:p-10 ${
        secondary
          ? "bg-[linear-gradient(135deg,rgba(76,185,214,0.11),rgba(47,103,255,0.05))]"
          : "bg-[linear-gradient(135deg,rgba(47,103,255,0.12),rgba(76,185,214,0.06))]"
      }`}
    >
      <div className="eyebrow">{eyebrow}</div>
      <h3 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em]">{title}</h3>
      <div className="mt-8 space-y-3">
        {points.map((point) => (
          <div key={point} className="list-row flex items-start gap-3 p-4">
            <div className="mt-1 rounded-full bg-[rgba(47,103,255,0.1)] p-1.5 text-[var(--app-accent)]">
              <CheckCircle2 size={14} aria-hidden="true" />
            </div>
            <p className="text-sm leading-7">{point}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[var(--app-accent)]">
        <Layers3 size={16} aria-hidden="true" />
        Premium workflow surface
      </div>
    </div>
  );
}
