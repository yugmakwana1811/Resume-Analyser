import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Building, Globe, Briefcase, ArrowLeft } from "lucide-react";

export default function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch(`/api/companies/${id}`);
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          throw new Error(error.error || "Unable to load this company.");
        }
        const data = await res.json();
        setCompany(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-sans">Loading company...</div>;
  if (!company) return <div className="h-screen flex items-center justify-center font-sans text-xl">Company not found.</div>;

  return (
    <div className="app-shell min-h-screen pt-12 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/dashboard/jobs" className="mb-8 flex items-center gap-2 text-sm font-semibold text-[var(--app-text-muted)] transition-colors hover:text-[var(--app-text)]">
          <ArrowLeft size={16} /> Back to Jobs
        </Link>
        <div className="panel-surface-strong mb-8 rounded-[3rem] p-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl bg-[rgba(93,107,255,0.08)] text-5xl font-semibold text-[var(--app-text-soft)]">
               {company.companyName?.[0]}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="mb-2 text-4xl font-semibold tracking-tight">{company.companyName}</h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-[var(--app-text-muted)] md:justify-start">
                {company.industry && <div className="flex items-center gap-1"><Briefcase size={16} /> {company.industry}</div>}
                {company.size && <div className="flex items-center gap-1"><Building size={16} /> {company.size} EMPLOYEES</div>}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 transition-colors hover:text-[var(--app-accent)]"
                  >
                    <Globe size={16} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {company.description && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">About Us</h3>
                <p className="text-sm leading-relaxed opacity-80">{company.description}</p>
              </div>
            )}
            
            {company.culture && (
              <div className="gradient-surface rounded-3xl p-8">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-accent)]">Company Culture</h3>
                <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">{company.culture}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Open Roles ({company.jobs?.length || 0})</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {company.jobs?.map((job: any) => (
               <div key={job.id} className="panel-surface rounded-2xl p-6 transition-all hover:-translate-y-0.5">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-bold mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                          <span>{job.location || 'Remote'}</span> • <span>{job.type || 'Full Time'}</span>
                        </div>
                     </div>
                     <Link
                       to={`/dashboard/jobs?id=${job.id}`}
                       className="button-secondary rounded-lg px-3 py-1 text-sm font-semibold text-[var(--app-accent)]"
                     >
                       View Job
                     </Link>
                   </div>
                </div>
            ))}
            {(!company.jobs || company.jobs.length === 0) && (
              <div className="panel-surface col-span-2 rounded-3xl py-12 text-center text-[var(--app-text-soft)]">
                No active job listings found for this company.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
