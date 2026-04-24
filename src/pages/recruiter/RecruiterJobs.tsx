import { useEffect, useState } from "react";
import { User } from "../../App";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Briefcase,
  DollarSign,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { aiService } from "../../services/aiService";

const initialFormData = {
  title: "",
  company: "",
  description: "",
  requirements: "",
  location: "",
  salary: "",
  category: "Engineering",
  type: "FULL_TIME",
  experienceLevel: "MID_LEVEL",
  workMode: "REMOTE",
  companySize: "MID_SIZE",
};

export default function RecruiterJobs({ user }: { user: User }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (!user?.recruiterId) {
      setLoading(false);
      return;
    }

    fetchJobs();
  }, [user?.recruiterId]);

  const fetchJobs = async () => {
    if (!user?.recruiterId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/recruiters/${user.recruiterId}/jobs`);
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title || !formData.company) {
      alert("Please enter a job title and company name first.");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      description: "AI is crafting the job description...",
    }));

    try {
      const description = await aiService.generateJobDescription(
        formData.title,
        formData.company,
        formData.type,
      );
      setFormData((previous) => ({ ...previous, description }));
    } catch (error) {
      console.error(error);
      setFormData((previous) => ({
        ...previous,
        description: "We couldn't generate a description right now. Please try again.",
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recruiterId: user?.recruiterId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create job");
      }

      await fetchJobs();
      setShowForm(false);
      setFormData(initialFormData);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Unable to create the job right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    setDeletingId(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to delete job");
      }

      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Unable to delete this listing right now.");
    } finally {
      setDeletingId(null);
    }
  };

  const getAnalytics = (job: any, index: number) => ({
    views: job.viewCount ?? (index + 1) * 17,
    applicants: job._count?.applications ?? Math.max(0, Math.round((job.viewCount ?? 0) / 6)),
  });

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="eyebrow mb-2">Recruiter Listings</div>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Manage Roles with Cleaner Analytics</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
            Review listing performance, applicant volume, and posting quality from one higher-trust recruiter surface.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
        >
          <Plus size={20} aria-hidden="true" /> Create Listing
        </button>
        </div>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="panel-surface h-32 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job, index) => {
            const analytics = getAnalytics(job, index);

            return (
              <div
                key={job.id}
                className="list-row transition-premium group flex flex-col gap-6 rounded-3xl p-6 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(70,102,255,0.08)] text-xl font-semibold text-[var(--app-text-soft)]">
                    {job.title[0]}
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--app-text-muted)]">
                      <span className="rounded-full bg-[rgba(70,102,255,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--app-accent)]">
                        {job.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} aria-hidden="true" /> {job.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={12} aria-hidden="true" /> {job.salary || "Compensation not set"}
                      </div>
                      {job.workMode && <span>{job.workMode.replaceAll("_", " ")}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                  <AnalyticsCard label="Views" value={analytics.views} icon={<Eye size={16} />} />
                  <AnalyticsCard
                    label="Applicants"
                    value={analytics.applicants}
                    icon={<Users size={16} />}
                  />
                  <button
                    onClick={() => handleDelete(job.id)}
                    disabled={deletingId === job.id}
                    className="button-ghost rounded-xl p-3 text-[var(--app-text-soft)] hover:bg-red-50 hover:text-[var(--app-danger)] disabled:opacity-50"
                    title="Delete Job"
                    aria-label="Delete Job"
                  >
                    {deletingId === job.id ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="section-shell rounded-[3rem] py-24 text-center">
          <Briefcase size={48} className="mx-auto mb-6 text-[var(--app-text-soft)]" aria-hidden="true" />
          <h3 className="mb-2 text-xl font-bold">No active listings</h3>
          <p className="mx-auto max-w-sm text-[var(--app-text-soft)]">
            Create your first job posting to start tracking engagement and incoming applicants.
          </p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-[rgba(20,24,40,0.28)] backdrop-blur-sm"
              onClick={() => !submitting && setShowForm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="panel-surface-strong relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[3rem]"
            >
              <div className="gradient-surface flex items-center justify-between p-8">
                <div>
                  <div className="eyebrow mb-2 text-[var(--app-accent)]">Create a Listing</div>
                  <h2 className="text-2xl font-semibold tracking-tight">Post New Role</h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  aria-label="Close Listing Form"
                  className="button-secondary rounded-full p-2"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto p-10">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    label="Job Title"
                    placeholder="Senior Engineer"
                    value={formData.title}
                    onChange={(value) => setFormData({ ...formData, title: value })}
                  />
                  <FormField
                    label="Company Name"
                    placeholder="ApplyIQ Inc."
                    value={formData.company}
                    onChange={(value) => setFormData({ ...formData, company: value })}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    label="Location"
                    placeholder="Remote / New York"
                    value={formData.location}
                    onChange={(value) => setFormData({ ...formData, location: value })}
                    required={false}
                  />
                  <FormField
                    label="Salary Range"
                    placeholder="$120k - $160k"
                    value={formData.salary}
                    onChange={(value) => setFormData({ ...formData, salary: value })}
                    required={false}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <SelectField
                    label="Category"
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                    options={[
                      { value: "Engineering", label: "Engineering" },
                      { value: "Design", label: "Design" },
                      { value: "Marketing", label: "Marketing" },
                      { value: "Management", label: "Management" },
                      { value: "Sales", label: "Sales" },
                    ]}
                  />
                  <SelectField
                    label="Employment Type"
                    value={formData.type}
                    onChange={(value) => setFormData({ ...formData, type: value })}
                    options={[
                      { value: "FULL_TIME", label: "Full Time" },
                      { value: "PART_TIME", label: "Part Time" },
                      { value: "INTERNSHIP", label: "Internship" },
                    ]}
                  />
                  <SelectField
                    label="Experience Level"
                    value={formData.experienceLevel}
                    onChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                    options={[
                      { value: "ENTRY", label: "Entry" },
                      { value: "MID_LEVEL", label: "Mid-Level" },
                      { value: "SENIOR", label: "Senior" },
                      { value: "DIRECTOR", label: "Director" },
                    ]}
                  />
                  <SelectField
                    label="Work Mode"
                    value={formData.workMode}
                    onChange={(value) => setFormData({ ...formData, workMode: value })}
                    options={[
                      { value: "REMOTE", label: "Remote" },
                      { value: "HYBRID", label: "Hybrid" },
                      { value: "ONSITE", label: "Onsite" },
                    ]}
                  />
                </div>

                <SelectField
                  label="Company Size"
                  value={formData.companySize}
                  onChange={(value) => setFormData({ ...formData, companySize: value })}
                  options={[
                    { value: "STARTUP", label: "Startup" },
                    { value: "MID_SIZE", label: "Mid-size" },
                    { value: "ENTERPRISE", label: "Enterprise" },
                  ]}
                />

                <div>
                  <div className="mb-2 flex items-end justify-between">
                    <label className="ml-1 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                      Job Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-accent)] hover:underline"
                    >
                      <Wand2 size={12} aria-hidden="true" /> Auto-Write with AI
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Detail the responsibilities, impact, and daily tasks…"
                    className="field-shell w-full resize-none rounded-xl px-4 py-3 font-medium"
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="ml-1 mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                    Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="List must-have skills, qualifications, or keywords…"
                    className="field-shell w-full resize-none rounded-xl px-4 py-3 font-medium"
                    value={formData.requirements}
                    onChange={(event) => setFormData({ ...formData, requirements: event.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <button
                    disabled={submitting}
                    className="button-primary flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-lg font-semibold"
                  >
                    {submitting ? <Loader2 size={24} className="animate-spin" aria-hidden="true" /> : "Launch Listing"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnalyticsCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="panel-muted min-w-[96px] rounded-2xl px-4 py-3 text-center">
      <div className="mb-2 flex items-center justify-center gap-2 text-[var(--app-text-soft)]">{icon}</div>
      <div className="text-lg font-semibold text-[var(--app-text)]">{value}</div>
      <div className="mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">{label}</div>
    </div>
  );
}

function FormField({
  label,
  placeholder,
  value,
  onChange,
  required = true,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="ml-1 mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
        {label}
      </label>
      <input
        type="text"
        placeholder={`${placeholder}${placeholder.endsWith("…") ? "" : "…"}`}
        className="field-shell w-full rounded-xl px-4 py-3 font-medium"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="ml-1 mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
        {label}
      </label>
      <div className="relative">
        <select
          className="field-shell w-full appearance-none rounded-xl px-4 py-3 font-medium"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <BarChart3 size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--app-text-soft)]" aria-hidden="true" />
      </div>
    </div>
  );
}
