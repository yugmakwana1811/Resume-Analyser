import { useEffect, useMemo, useState } from "react";
import { User } from "../../App";
import { motion } from "motion/react";
import { CheckCircle, Search, User as UserIcon, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { safeJsonParse } from "../../lib/utils";

const statusStyles: Record<string, string> = {
  PENDING: "bg-orange-50 text-orange-600 border-orange-100",
  SHORTLISTED: "bg-green-50 text-green-600 border-green-100",
  REJECTED: "bg-red-50 text-red-600 border-red-100",
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
      alert(error.message || "Unable to update the candidate status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Talent Pool</h1>
          <p className="text-[#141414]/60">
            Review real applicants from your listings and move them through the pipeline.
          </p>
        </div>
        <div className="flex min-w-[320px] gap-2 rounded-2xl border border-[#141414]/5 bg-white p-2 shadow-sm">
          <div className="flex flex-1 items-center gap-2 pl-2">
            <Search size={18} className="text-[#141414]/40" />
            <input
              type="text"
              placeholder="Search by name, skill, or role"
              className="w-full bg-transparent py-2 text-sm outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-[2rem] bg-white" />
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
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-8 rounded-[2rem] border border-[#141414]/5 bg-white p-8 transition-all hover:border-blue-500/20 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100 text-blue-600">
                    <UserIcon size={28} />
                  </div>
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold">
                        {application.user?.profile?.name || application.user?.email}
                      </h3>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyles[status] || statusStyles.PENDING}`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mb-3 text-sm font-medium text-[#141414]/60">
                      {application.job.title} at {application.job.company}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.length > 0 ? (
                        skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded-md bg-[#F5F5F0] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#141414]/40">
                          No parsed skills yet. Ask the candidate to upload a resume.
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-[#141414]/40">
                      Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <button
                    onClick={() => updateStatus(application.id, "SHORTLISTED")}
                    disabled={updatingId === application.id}
                    className="flex items-center gap-2 rounded-2xl bg-green-50 px-5 py-3 text-sm font-bold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                  >
                    <CheckCircle size={18} /> Shortlist
                  </button>
                  <button
                    onClick={() => updateStatus(application.id, "REJECTED")}
                    disabled={updatingId === application.id}
                    className="flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button
                    onClick={() => updateStatus(application.id, "PENDING")}
                    disabled={updatingId === application.id}
                    className="rounded-2xl bg-[#F5F5F0] px-5 py-3 text-sm font-bold text-[#141414] transition-colors hover:bg-[#eaeade] disabled:opacity-50"
                  >
                    Move to Pending
                  </button>
                  <Link
                    to={`/profile/${application.userId}`}
                    className="rounded-2xl bg-[#141414] px-6 py-4 text-sm font-bold text-[#F5F5F0] transition-opacity hover:opacity-90"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-[#141414]/5 bg-white py-20 text-center">
          <h3 className="mb-2 text-xl font-bold">No applicants yet</h3>
          <p className="text-[#141414]/40">
            Once candidates apply to your listings, they will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
