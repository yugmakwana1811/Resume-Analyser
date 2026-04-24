import { useEffect, useState } from "react";
import { User } from "../../App";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SeekerOverview({ user }: { user: User }) {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, matchResponse, applicationResponse] = await Promise.all([
          fetch(`/api/profile/${user?.id}`),
          fetch(`/api/matches/${user?.id}`),
          fetch(`/api/applications/${user?.id}`),
        ]);

        setProfile(await profileResponse.json());
        setMatches(await matchResponse.json());
        setApplications(await applicationResponse.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="page-hero h-56 animate-pulse" />
        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="section-shell h-36 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  const profileStrength = Math.min(
    100,
    [profile?.headline, profile?.bio, profile?.skills, profile?.experience, profile?.resume?.content]
      .filter(Boolean).length * 20,
  );
  const shortlistedCount = applications.filter((application) => application.status === "SHORTLISTED").length;
  const pendingCount = applications.filter((application) => application.status === "PENDING").length;

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="eyebrow">Candidate Overview</div>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] text-[var(--app-text)] md:text-5xl">
              Keep your profile strong and your next move obvious.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
              Your workspace is designed to show profile readiness, role fit, and application progress without burying the useful signal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/dashboard/resume"
                className="button-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Improve Resume <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/dashboard/jobs"
                className="button-secondary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Explore Matches
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <QuickMetric
              label="Profile Strength"
              value={`${profileStrength}%`}
              note="Built from completed sections"
              icon={<Sparkles size={16} aria-hidden="true" />}
            />
            <QuickMetric
              label="Matched Roles"
              value={String(matches.length)}
              note="Current AI-ranked opportunities"
              icon={<Star size={16} aria-hidden="true" />}
            />
            <QuickMetric
              label="Shortlisted"
              value={String(shortlistedCount)}
              note="Applications advanced by recruiters"
              icon={<CheckCircle2 size={16} aria-hidden="true" />}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="eyebrow">Top Matches</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-text)]">
                Roles worth reviewing first
              </h2>
            </div>
            <Link
              to="/dashboard/jobs"
              className="button-ghost rounded-full px-4 py-2 text-sm font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {matches.length > 0 ? (
              matches.slice(0, 3).map((match) => <JobMatchRow key={match.id} match={match} />)
            ) : (
              <EmptyMessage message="No matches yet. Complete your resume and profile details to start generating ranked opportunities." />
            )}
          </div>
        </section>

        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <div className="eyebrow">Career Signal</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-text)]">
            What to tighten next
          </h2>
          <div className="mt-6 space-y-4">
            <InsightRow
              title="Profile depth"
              description="Add measurable project outcomes and richer experience details to improve fit confidence."
              tone="primary"
            />
            <InsightRow
              title="Application momentum"
              description={`${pendingCount} application${pendingCount === 1 ? "" : "s"} are still pending. Consider applying to a few additional high-fit roles this week.`}
              tone="neutral"
            />
            <InsightRow
              title="Skill narrative"
              description="Explicitly naming role-relevant tools and systems can improve both recruiter scanning and AI match quality."
              tone="success"
            />
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-[rgba(70,102,255,0.08)] bg-[rgba(70,102,255,0.04)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--app-accent)]">
              <TrendingUp size={16} aria-hidden="true" />
              Growth Roadmap
            </div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-text-muted)]">
              Generate a roadmap from your current profile to see which skills and proof points will strengthen your trajectory fastest.
            </p>
            <Link
              to="/dashboard/roadmap"
              className="button-secondary mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            >
              Open Roadmap
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickMetric({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="workspace-stat p-4">
      <div className="flex items-center gap-2 text-[var(--app-text-soft)]">
        {icon}
        <span className="mono text-[11px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-[var(--app-text)]">{value}</div>
      <div className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">{note}</div>
    </div>
  );
}

function JobMatchRow({ match }: { match: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="list-row flex items-center justify-between gap-4 p-4"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[rgba(70,102,255,0.08)] text-sm font-semibold text-[var(--app-text-soft)]">
          {match.job.company?.[0] || "A"}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--app-text)]">{match.job.title}</h3>
          <p className="truncate text-sm text-[var(--app-text-muted)]">{match.job.company}</p>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xl font-semibold text-[var(--app-accent)]">{match.score}%</div>
        <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
          Match
        </div>
      </div>
    </motion.div>
  );
}

function InsightRow({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: "primary" | "neutral" | "success";
}) {
  const toneClass =
    tone === "success"
      ? "bg-[rgba(62,161,125,0.08)] text-[var(--app-success)]"
      : tone === "neutral"
        ? "bg-[rgba(25,36,71,0.06)] text-[var(--app-text-muted)]"
        : "bg-[rgba(70,102,255,0.08)] text-[var(--app-accent)]";

  return (
    <div className="list-row p-4">
      <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClass}`}>
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--app-text-muted)]">{description}</p>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="list-row p-6 text-sm leading-7 text-[var(--app-text-muted)]">
      {message}
    </div>
  );
}
