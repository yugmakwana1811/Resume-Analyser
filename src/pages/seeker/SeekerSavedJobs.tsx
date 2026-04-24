import { useState, useEffect } from "react";
import { User } from "../../App";
import { Briefcase, MapPin, DollarSign, BookmarkMinus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SeekerSavedJobs({ user }: { user: User }) {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/saved-jobs/${user?.id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load saved jobs.");
      }
      setSavedJobs(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId: string, savedJobId: string) => {
    try {
      const response = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, jobId }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to update saved jobs.");
      }
      setSavedJobs((previous) => previous.filter((savedJob) => savedJob.id !== savedJobId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="eyebrow mb-2">Saved Jobs</div>
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
          Keep priority roles in one focused shortlist.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
          Use saved jobs as your personal queue for deeper review and faster application decisions.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {loading ? (
          [1, 2, 3].map((item) => <div key={item} className="section-shell h-40 animate-pulse rounded-[2rem]" />)
        ) : savedJobs.length > 0 ? (
          savedJobs.map(({ id: savedJobId, job }) => (
            <div
              key={savedJobId}
              className="list-row transition-premium flex flex-col justify-between rounded-[2rem] p-6 hover:-translate-y-0.5"
            >
              <div>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(70,102,255,0.08)] text-2xl font-semibold text-[var(--app-text-soft)]">
                    {job.company[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[rgba(62,161,125,0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--app-success)]">
                      {job.type || "Full Time"}
                    </span>
                    <button
                      onClick={() => handleToggleSave(job.id, savedJobId)}
                      className="button-ghost rounded-full p-2 text-[var(--app-text-soft)] hover:text-[var(--app-danger)]"
                      title="Remove Saved Job"
                      aria-label="Remove Saved Job"
                    >
                      <BookmarkMinus size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-semibold">{job.title}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--app-text-muted)]">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={14} aria-hidden="true" /> {job.company}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} aria-hidden="true" /> {job.location || "Remote"}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[rgba(25,36,71,0.08)] pt-5">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <DollarSign size={14} className="text-[var(--app-success)]" aria-hidden="true" />
                  {job.salary || "$80k - $120k"}
                </div>
                <Link
                  to={`/dashboard/jobs?id=${job.id}`}
                  className="button-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                >
                  View Job <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="section-shell lg:col-span-2 rounded-[2rem] py-20 text-center">
            <BookmarkMinus size={46} className="mx-auto mb-4 text-[var(--app-text-soft)]" aria-hidden="true" />
            <h3 className="mb-2 text-xl font-semibold">No saved jobs</h3>
            <p className="text-[var(--app-text-soft)]">Jobs you bookmark will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
