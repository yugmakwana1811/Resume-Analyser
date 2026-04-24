import { useEffect, useState } from "react";
import { User } from "../../App";
import { motion } from "motion/react";
import { ArrowRight, Briefcase, CheckCircle2, Eye, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

type OverviewResponse = {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    shortlisted: number;
    totalViews: number;
  };
  pipeline: { label: string; count: number }[];
  recentActivity: {
    id: string;
    candidateName: string;
    jobTitle: string;
    company: string;
    appliedAt: string;
    status: string;
    matchScore: number | null;
  }[];
};

const emptyOverview: OverviewResponse = {
  stats: {
    activeJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    totalViews: 0,
  },
  pipeline: [],
  recentActivity: [],
};

export default function RecruiterOverview({ user }: { user: User }) {
  const [overview, setOverview] = useState<OverviewResponse>(emptyOverview);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.recruiterId) {
      setLoading(false);
      return;
    }

    const fetchOverview = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/recruiters/${user.recruiterId}/overview`);
        setOverview(await response.json());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [user?.recruiterId]);

  if (loading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="page-hero h-56 animate-pulse" />
        <div className="grid gap-5 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="section-shell h-32 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  const maxPipelineCount = Math.max(...overview.pipeline.map((item) => item.count), 1);

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="grid gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:items-end">
          <div>
            <div className="eyebrow">Recruiter Overview</div>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] text-[var(--app-text)] md:text-5xl">
              Run hiring with clearer signal and less operational drag.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
              See what is performing, which candidates are moving, and where recruiter attention should go next without parsing a wall of dashboard cards.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/dashboard/jobs"
                className="button-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Open Listings <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                to="/dashboard/candidates"
                className="button-secondary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Review Candidates
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <RecruiterMetric
              label="Active Jobs"
              value={overview.stats.activeJobs}
              icon={<Briefcase size={16} aria-hidden="true" />}
            />
            <RecruiterMetric
              label="Applicants"
              value={overview.stats.totalApplicants}
              icon={<Users size={16} aria-hidden="true" />}
            />
            <RecruiterMetric
              label="Shortlisted"
              value={overview.stats.shortlisted}
              icon={<CheckCircle2 size={16} aria-hidden="true" />}
            />
            <RecruiterMetric
              label="Views"
              value={overview.stats.totalViews}
              icon={<Eye size={16} aria-hidden="true" />}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="eyebrow">Recent Activity</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--app-text)]">
                Candidate movement you should review
              </h2>
            </div>
            <Link
              to="/dashboard/candidates"
              className="button-ghost rounded-full px-4 py-2 text-sm font-semibold"
            >
              See All
            </Link>
          </div>

          <div className="space-y-3">
            {overview.recentActivity.length > 0 ? (
              overview.recentActivity.map((activity) => (
                <div key={activity.id} className="list-row flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[rgba(70,102,255,0.08)] text-sm font-semibold text-[var(--app-text-soft)]">
                      {activity.candidateName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[var(--app-text)]">
                        {activity.candidateName}
                      </h3>
                      <p className="truncate text-sm text-[var(--app-text-muted)]">
                        {activity.jobTitle} • {activity.company}
                      </p>
                      <p className="mono mt-1 text-[11px] text-[var(--app-text-soft)]">
                        {new Date(activity.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-[var(--app-accent)]">
                      {activity.matchScore !== null ? `${activity.matchScore}% Fit` : activity.status}
                    </div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                      {activity.matchScore !== null ? "AI Score" : "Status"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="list-row p-6 text-sm leading-7 text-[var(--app-text-muted)]">
                Candidate activity will appear here as soon as new applications start moving through the pipeline.
              </div>
            )}
          </div>
        </section>

        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--app-accent)]" aria-hidden="true" />
            <div className="eyebrow">Hiring Pipeline</div>
          </div>

          <div className="space-y-5">
            {overview.pipeline.length > 0 ? (
              overview.pipeline.map((stage) => (
                <div key={stage.label} className="list-row p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--app-text)]">{stage.label}</span>
                    <span className="mono text-xs text-[var(--app-text-soft)]">{stage.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(70,102,255,0.08)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((stage.count / maxPipelineCount) * 100)}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-secondary))]"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="list-row p-6 text-sm leading-7 text-[var(--app-text-muted)]">
                Pipeline data will populate once candidates begin applying to your live roles.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[rgba(70,102,255,0.08)] bg-[rgba(70,102,255,0.04)] p-4">
            <div className="text-sm font-semibold text-[var(--app-accent)]">Backend-backed analytics</div>
            <p className="mt-2 text-sm leading-7 text-[var(--app-text-muted)]">
              Listing views and applicant counts are now surfaced from the backend so recruiter reporting stays tied to actual product activity.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function RecruiterMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="workspace-stat p-4">
      <div className="flex items-center gap-2 text-[var(--app-text-soft)]">
        {icon}
        <span className="mono text-[11px] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-[var(--app-text)]">{value}</div>
    </div>
  );
}
