import { useState, useEffect } from "react";
import { User } from "../../App";
import { motion } from "motion/react";
import { Briefcase, FileText, CheckCircle, TrendingUp, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function SeekerOverview({ user }: { user: User }) {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, matchRes, applicationRes] = await Promise.all([
          fetch(`/api/profile/${user?.id}`),
          fetch(`/api/matches/${user?.id}`),
          fetch(`/api/applications/${user?.id}`)
        ]);
        setProfile(await profRes.json());
        setMatches(await matchRes.json());
        setApplications(await applicationRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="panel-surface h-32 rounded-3xl"></div>
    <div className="grid grid-cols-3 gap-6">
        <div className="panel-surface h-24 rounded-2xl"></div>
        <div className="panel-surface h-24 rounded-2xl"></div>
        <div className="panel-surface h-24 rounded-2xl"></div>
    </div>
  </div>;

  const profileStrength = Math.min(
    100,
    [profile?.headline, profile?.bio, profile?.skills, profile?.experience, profile?.resume?.content]
      .filter(Boolean).length * 20,
  );
  const shortlistedCount = applications.filter(app => app.status === "SHORTLISTED").length;

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="eyebrow mb-2">Candidate Workspace</div>
        <h1 className="mb-2 text-4xl font-semibold tracking-[-0.04em]">Welcome back</h1>
        <p className="text-[var(--app-text-muted)]">{user?.email}</p>
      </header>

      {/* Profile Health */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-surface relative overflow-hidden rounded-[2.5rem] p-8"
      >
        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
                <div className="eyebrow mb-4 text-[var(--app-accent)]">Profile Strength</div>
                <div className="mb-4 text-5xl font-semibold tracking-tight">{profileStrength}%</div>
                <p className="mb-6 max-w-sm text-sm leading-7 text-[var(--app-text-muted)]">
                  Complete your technical projects section to boost your match accuracy by 15%.
                </p>
                <Link to="/dashboard/resume" className="button-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all">
                    Optimize Now <ArrowRight size={16} />
                </Link>
            </div>
            <div className="flex gap-4">
                <StatBox label="Jobs Matched" value={matches.length.toString()} icon={<Star className="text-yellow-400" size={16} />} />
                <StatBox label="Applications" value={applications.length.toString()} icon={<FileText className="text-blue-400" size={16} />} />
                <StatBox label="Shortlisted" value={shortlistedCount.toString()} icon={<CheckCircle className="text-green-400" size={16} />} />
            </div>
        </div>
        <div className="absolute right-[-10%] top-[-20%] h-64 w-64 rounded-full bg-[rgba(93,107,255,0.12)] blur-3xl"></div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Top Job Matches</h2>
            <Link to="/dashboard/jobs" className="text-xs font-bold uppercase tracking-widest text-[#141414]/40 hover:text-[#141414] transition-colors">View All</Link>
          </div>
          <div className="space-y-4">
            {matches.length > 0 ? matches.slice(0, 3).map((match: any) => (
              <JobMatchCard key={match.id} match={match} />
            )) : (
              <div className="panel-surface rounded-2xl p-8 text-center">
                <p className="text-sm font-medium text-[var(--app-text-soft)]">No matches found. Upload your resume to begin.</p>
              </div>
            )}
          </div>
        </section>

        {/* Career Insights */}
        <section>
            <h2 className="text-xl font-bold tracking-tight mb-6">Career Insights</h2>
            <div className="panel-surface rounded-3xl p-6">
                <div className="space-y-6">
                    <InsightItem 
                        title="Skill Trends" 
                        description="React and TypeScript are in high demand for your matched roles."
                        trend={true}
                    />
                    <InsightItem 
                        title="Experience Gap" 
                        description="Adding Cloud certification could increase your visibility."
                        trend={false}
                    />
                    <div className="mt-4 border-t border-[rgba(41,49,81,0.08)] pt-4 text-center">
                        <Link to="/dashboard/roadmap" className="text-sm font-semibold text-[var(--app-accent)] hover:underline">View your growth roadmap</Link>
                    </div>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="w-32 rounded-2xl border border-white/80 bg-white/72 p-4 shadow-sm backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-2 text-[var(--app-text-soft)]">
                {icon}
                <span className="text-[10px] uppercase font-semibold tracking-[0.18em]">{label}</span>
            </div>
            <div className="text-2xl font-semibold text-[var(--app-text)]">{value}</div>
        </div>
    );
}

function JobMatchCard({ match }: { match: any }) {
    return (
        <div className="panel-surface flex items-center justify-between rounded-2xl p-6 transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(93,107,255,0.08)] text-xl font-semibold text-[var(--app-text-soft)]">
                    {match.job.company[0]}
                </div>
                <div>
                    <h3 className="font-bold text-sm">{match.job.title}</h3>
                    <p className="text-xs text-[var(--app-text-muted)]">{match.job.company}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <div className="text-lg font-semibold leading-none text-[var(--app-accent)]">{match.score}%</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--app-text-soft)]">Match</div>
                </div>
                <ArrowRight size={16} className="text-[var(--app-text-soft)]" />
            </div>
        </div>
    );
}

function InsightItem({ title, description, trend }: { title: string, description: string, trend: boolean }) {
    return (
        <div className="flex gap-4">
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${trend ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {trend ? <TrendingUp size={20} /> : <Star size={20} />}
            </div>
            <div>
                <h4 className="font-bold text-sm mb-1">{title}</h4>
                <p className="text-xs text-[#141414]/60 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
