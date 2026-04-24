import { useEffect, useMemo, useState } from "react";
import { User } from "../../App";
import { motion } from "motion/react";
import { CheckCircle, Search, User as UserIcon, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { safeJsonParse } from "../../lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "bg-[rgba(217,139,50,0.1)] text-[var(--app-warning)] border-[rgba(217,139,50,0.2)]",
  SHORTLISTED: "bg-[rgba(62,161,125,0.12)] text-[var(--app-success)] border-[rgba(62,161,125,0.2)]",
  REJECTED: "bg-[rgba(211,96,102,0.12)] text-[var(--app-danger)] border-[rgba(211,96,102,0.2)]",
};

export default function RecruiterCandidates({ user }: { user: User }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.recruiterId) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/recruiters/${user.recruiterId}/applications`);
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || "Unable to load applicants.");
        }
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user?.recruiterId]);

  const filteredApplications = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return applications;

    return applications.filter((application) => {
      const profileName = application.user?.profile?.name?.toLowerCase() || "";
      const email = application.user?.email?.toLowerCase() || "";
      const jobTitle = application.job?.title?.toLowerCase() || "";
      const skills = safeJsonParse<string[]>(application.user?.profile?.skills, [])
        .join(" ")
        .toLowerCase();

      return [profileName, email, jobTitle, skills].some((value) => value.includes(term));
    });
  }, [applications, query]);

  const updateStatus = async (applicationId: string, status: "PENDING" | "SHORTLISTED" | "REJECTED") => {
    setUpdatingId(applicationId);
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to update application status");
      }

      const updatedApplication = await response.json();
      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId ? updatedApplication : application,
        ),
      );
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Unable to update candidate status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="eyebrow mb-2">Talent Pool</div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Review applicants with fast, high-signal actions.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
              Search by candidate, role, or skill and move each applicant through the pipeline without leaving the workspace.
            </p>
          </div>
          <div className="toolbar-shell min-w-[320px]">
            <div className="flex flex-1 items-center gap-2 pl-2">
              <Search size={18} className="text-[var(--app-text-soft)]" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by name, skill, or role..."
                className="w-full bg-transparent py-2 text-sm"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="section-shell h-32 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="grid gap-4">
          {filteredApplications.map((application) => {
            const skills = safeJsonParse<string[]>(application.user?.profile?.skills, []).slice(0, 4);
            const status = application.status || "PENDING";

            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                className="list-row flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(70,102,255,0.1)] text-[var(--app-accent)]">
                    <UserIcon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {application.user?.profile?.name || application.user?.email}
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusStyles[status] || statusStyles.PENDING}`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--app-text-muted)]">
                      {application.job.title} at {application.job.company}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.length > 0 ? (
                        skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="status-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--app-text-soft)]">
                          No parsed skills yet.
                        </span>
                      )}
                    </div>
                    <p className="mono mt-3 text-[11px] text-[var(--app-text-soft)]">
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <button
                    onClick={() => updateStatus(application.id, "SHORTLISTED")}
                    disabled={updatingId === application.id}
                    className="button-secondary rounded-xl px-4 py-2 text-sm font-semibold text-[var(--app-success)] disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle size={16} aria-hidden="true" /> Shortlist
                    </span>
                  </button>
                  <button
                    onClick={() => updateStatus(application.id, "REJECTED")}
                    disabled={updatingId === application.id}
                    className="button-secondary rounded-xl px-4 py-2 text-sm font-semibold text-[var(--app-danger)] disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <XCircle size={16} aria-hidden="true" /> Reject
                    </span>
                  </button>
                  <button
                    onClick={() => updateStatus(application.id, "PENDING")}
                    disabled={updatingId === application.id}
                    className="button-secondary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    Pending
                  </button>
                  <Link
                    to={`/profile/${application.userId}`}
                    className="button-primary rounded-xl px-5 py-2 text-sm font-semibold"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="section-shell rounded-[2rem] py-20 text-center">
          <h3 className="mb-2 text-xl font-semibold">No applicants yet</h3>
          <p className="text-[var(--app-text-soft)]">Candidates will appear here once they apply to your listings.</p>
        </div>
      )}
    </div>
  );
}
