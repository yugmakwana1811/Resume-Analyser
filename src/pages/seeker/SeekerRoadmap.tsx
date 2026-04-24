import { useState, useEffect } from "react";
import { User } from "../../App";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Zap, Loader2, Target, Calendar, ListChecks, Sparkles } from "lucide-react";
import { aiService } from "../../services/aiService";

export default function SeekerRoadmap({ user }: { user: User }) {
  const [targetRole, setTargetRole] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${user?.id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load your profile.");
      }
      setProfile(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async () => {
    if (!profile || !targetRole) return;
    setGenerating(true);
    try {
      const result = await aiService.generateRoadmap(targetRole, profile);
      setRoadmap(result);
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="eyebrow mb-2">Career Roadmap</div>
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
          Build a concrete path from where you are to where you want to be.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
          Set your target role and generate a step-by-step progression plan with milestones, skills, and duration estimates.
        </p>
      </header>

      <section className="section-shell rounded-[2rem] p-6 md:p-7">
        <div className="max-w-3xl">
          <label className="mb-3 ml-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
            Target Professional Role
          </label>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Target className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-soft)]" size={18} />
              <input
                type="text"
                placeholder="e.g. Senior Frontend Architect, Product Manager..."
                className="field-shell w-full rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !targetRole}
              className="button-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {generating ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Zap size={18} aria-hidden="true" />}
              {generating ? "Generating..." : "Build Path"}
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {generating ? (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="section-shell rounded-[2rem] py-16 text-center"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(70,102,255,0.08)] text-[var(--app-accent)]">
              <Sparkles size={30} className="animate-pulse" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-semibold">Analyzing your skill trajectory...</h3>
            <p className="mt-2 text-sm text-[var(--app-text-soft)]">
              Building a personalized progression plan.
            </p>
          </motion.section>
        ) : null}

        {roadmap && !generating ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <section className="gradient-surface rounded-[2rem] p-6 md:p-7">
              <div className="eyebrow mb-2 text-[var(--app-accent)]">Roadmap Summary</div>
              <h2 className="text-3xl font-semibold tracking-tight">Path to {targetRole}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--app-text-muted)]">
                Estimated duration: <span className="font-semibold text-[var(--app-accent)]">{roadmap.totalEstimatedTime}</span>
              </p>
            </section>

            <section className="space-y-4">
              {roadmap.steps?.map((step: any, index: number) => (
                <motion.div
                  key={`${step.milestone}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="list-row rounded-[2rem] p-6"
                >
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--app-accent)]">
                        Step {index + 1}
                      </div>
                      <h3 className="mt-1 text-xl font-semibold">{step.milestone}</h3>
                    </div>
                    <div className="status-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]">
                      <Calendar size={12} aria-hidden="true" />
                      {step.duration}
                    </div>
                  </div>

                  <p className="text-sm leading-8 text-[var(--app-text-muted)]">{step.description}</p>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                      <ListChecks size={14} aria-hidden="true" />
                      Skills to Master
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {step.skillsToLearn?.map((skill: string, skillIndex: number) => (
                        <span
                          key={`${skill}-${skillIndex}`}
                          className="status-chip rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </section>

            <section className="section-shell rounded-[2rem] p-8 text-center">
              <h4 className="text-xl font-semibold">Start this week</h4>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--app-text-muted)]">
                Consistency compounds. Pick the first milestone, execute weekly, and revisit this roadmap as your profile evolves.
              </p>
              <button className="button-primary mx-auto mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold">
                Track Progress <ArrowRight size={16} aria-hidden="true" />
              </button>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
