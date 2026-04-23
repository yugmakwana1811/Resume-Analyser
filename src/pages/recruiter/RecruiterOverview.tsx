import { useEffect, useState } from "react";
import { User } from "../../App";
import { motion } from "motion/react";
import { ArrowRight, BarChart3, Briefcase, CheckCircle, Eye, Users } from "lucide-react";
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
        const data = await response.json();
        setOverview(data);
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
      <div className="space-y-8">
        <div className="panel-surface h-32 animate-pulse rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="panel-surface h-24 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const maxPipelineCount = Math.max(...overview.pipeline.map((item) => item.count), 1);

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="eyebrow mb-2">Recruiter Workspace</div>
        <h1 className="mb-2 text-4xl font-semibold tracking-[-0.04em]">Hiring Dashboard</h1>
        <p className="text-[var(--app-text-muted)]">
          Watch role performance, track applicants, and act on the latest candidate activity.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard
          label="Active Jobs"
          value={overview.stats.activeJobs}
          icon={<Briefcase size={20} className="text-blue-500" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Applicants"
          value={overview.stats.totalApplicants}
          icon={<Users size={20} className="text-emerald-500" />}
          color="bg-emerald-50"
        />
        <StatCard
          label="Shortlisted"
          value={overview.stats.shortlisted}
          icon={<CheckCircle size={20} className="text-green-500" />}
          color="bg-green-50"
        />
        <StatCard
          label="Views"
          value={overview.stats.totalViews}
          icon={<Eye size={20} className="text-orange-500" />}
          color="bg-orange-50"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
              <Link
                to="/dashboard/candidates"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)] transition-colors hover:text-[var(--app-text)]"
              >
                Review Applicants
              </Link>
            </div>

            <div className="panel-surface divide-y divide-[rgba(41,49,81,0.08)] rounded-3xl">
              {overview.recentActivity.length > 0 ? (
                overview.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-4 p-6 transition-colors hover:bg-white/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(93,107,255,0.08)] text-xs font-semibold uppercase text-[var(--app-text-muted)]">
                        {activity.candidateName.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">
                          {activity.candidateName} applied for {activity.jobTitle}
                        </h4>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                          {new Date(activity.appliedAt).toLocaleDateString()} at {activity.company}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-[var(--app-accent)]">
                        {activity.matchScore !== null ? `${activity.matchScore}% Fit` : activity.status}
                      </div>
                      <div className="text-[8px] uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                        {activity.matchScore !== null ? "AI Score" : "Status"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-[var(--app-text-soft)]">
                  New candidate activity will appear here as applications come in.
                </div>
              )}
            </div>
          </section>

          <section className="gradient-surface relative overflow-hidden rounded-[3rem] p-10">
            <div className="relative z-10">
              <div className="eyebrow mb-3 text-[var(--app-accent)]">Backend-backed insights</div>
              <h3 className="mb-4 text-2xl font-semibold">Analytics at a glance</h3>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-[var(--app-text-muted)]">
                Listing views and applicant volume now update directly from the backend, so your recruiter dashboard reflects real activity instead of placeholders.
              </p>
              <Link
                to="/dashboard/jobs"
                className="button-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
              >
                Open Listings <ArrowRight size={18} />
              </Link>
            </div>
            <div className="absolute bottom-[-20%] right-[-10%] h-64 w-64 rounded-full bg-[rgba(163,140,247,0.16)] blur-3xl" />
          </section>
        </div>

        <div className="lg:col-span-1">
          <section className="panel-surface h-full rounded-[3rem] p-8">
            <div className="mb-8 flex items-center gap-2">
              <BarChart3 size={18} className="text-[var(--app-text-soft)]" />
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                Hiring Pipeline
              </h2>
            </div>
            <div className="space-y-8">
              {overview.pipeline.length > 0 ? (
                overview.pipeline.map((stage) => (
                  <PipelineStage
                    key={stage.label}
                    label={stage.label}
                    count={stage.count}
                    percentage={Math.round((stage.count / maxPipelineCount) * 100)}
                  />
                ))
              ) : (
                <p className="text-sm text-[var(--app-text-soft)]">
                  Pipeline data will appear after your first application arrives.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="panel-surface flex flex-col items-center rounded-[2.5rem] p-8 text-center">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>{icon}</div>
      <div className="mb-1 text-4xl font-semibold">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">{label}</div>
    </div>
  );
}

function PipelineStage({
  label,
  count,
  percentage,
}: {
  label: string;
  count: number;
  percentage: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-[var(--app-text-muted)]">{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(93,107,255,0.08)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-[linear-gradient(135deg,var(--app-accent),var(--app-secondary))]"
        />
      </div>
    </div>
  );
}
