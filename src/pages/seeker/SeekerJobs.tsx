import { useEffect, useState } from "react";
import { User } from "../../App";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  DollarSign,
  FileText,
  Filter,
  Loader2,
  MapPin,
  MessageSquareWarning,
  RefreshCcw,
  Search,
  Sparkles,
  Star,
  X,
  Zap,
  Building,
  ScrollText,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { useSearchParams } from "react-router-dom";

export default function SeekerJobs({ user }: { user: User }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterInstructions, setCoverLetterInstructions] = useState("");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [category, setCategory] = useState("All Roles");
  const [requirements, setRequirements] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchProfile();
    fetchSavedJobs();
  }, [user?.id]);

  useEffect(() => {
    fetchJobs();
  }, [category]);

  useEffect(() => {
    const jobIdFromUrl = searchParams.get("id");
    if (!jobIdFromUrl || jobs.length === 0 || selectedJob) return;

    const job = jobs.find((item) => item.id === jobIdFromUrl);
    if (!job) return;

    void openJob(job);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("id");
    setSearchParams(nextParams, { replace: true });
  }, [jobs, searchParams, selectedJob, setSearchParams]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${user?.id}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch(`/api/saved-jobs/${user?.id}`);
      const data = await response.json();
      setSavedJobs(data.map((savedJob: any) => savedJob.jobId));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (category && category !== "All Roles") params.append("category", category);
      if (requirements) params.append("requirements", requirements);
      if (experienceLevel) params.append("experienceLevel", experienceLevel);
      if (workMode) params.append("workMode", workMode);
      if (companySize) params.append("companySize", companySize);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const response = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, jobId }),
      });
      const data = await response.json();

      if (data.saved) {
        setSavedJobs((currentSavedJobs) => [...currentSavedJobs, jobId]);
      } else {
        setSavedJobs((currentSavedJobs) => currentSavedJobs.filter((id) => id !== jobId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const trackJobView = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/view`, { method: "POST" });
      const data = await response.json();

      setJobs((currentJobs) =>
        currentJobs.map((job) => (job.id === jobId ? { ...job, viewCount: data.viewCount } : job)),
      );
      setSelectedJob((currentSelectedJob: any) =>
        currentSelectedJob?.id === jobId ? { ...currentSelectedJob, viewCount: data.viewCount } : currentSelectedJob,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const openJob = async (job: any, resetMatch = true) => {
    setSelectedJob(job);
    setFeedbackText("");
    setCoverLetterInstructions("");
    setShowCoverLetter(false);
    setCoverLetterText("");

    if (resetMatch) {
      setMatchResult(null);
    }

    await trackJobView(job.id);
  };

  const handleMatch = async (job: any, force = false) => {
    if (!profile || !user?.id) {
      alert("Please complete your profile before running AI match.");
      return;
    }

    await openJob(job, !force);
    setMatching(true);
    if (!force) {
      setMatchResult(null);
    }

    try {
      const result = await aiService.matchJob(user.id, job.id, force);
      setMatchResult(result);
    } catch (error) {
      console.error(error);
      alert("We couldn't generate the AI match right now.");
    } finally {
      setMatching(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedJob || !user?.id) return;

    setGeneratingLetter(true);
    try {
      const result = await aiService.generateCoverLetter(
        user.id,
        selectedJob.id,
        coverLetterInstructions,
      );
      setCoverLetterText(result.coverLetter);
      setShowCoverLetter(true);
    } catch (error) {
      console.error(error);
      alert("We couldn't generate the cover letter right now.");
    } finally {
      setGeneratingLetter(false);
    }
  };

  const handleApply = async () => {
    if (!selectedJob || !user) return;

    setSubmittingApplication(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          jobId: selectedJob.id,
          coverLetter: coverLetterText || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit application");
      }

      alert("Application submitted successfully!");
      setSelectedJob(null);
      setMatchResult(null);
      setShowCoverLetter(false);
      setCoverLetterText("");
      setCoverLetterInstructions("");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Unable to submit application");
    } finally {
      setSubmittingApplication(false);
    }
  };

  const submitFeedback = async (jobId: string) => {
    if (!feedbackText.trim()) return;

    setSubmittingFeedback(true);
    try {
      await fetch(`/api/jobs/${jobId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          rating: 3,
          comment: feedbackText,
          issueType: "REPORT",
        }),
      });
      alert("Feedback submitted. Thank you!");
      setFeedbackText("");
    } catch (error) {
      console.error(error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="eyebrow mb-2">Job Discovery</div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Review opportunities with more context and less noise.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
              Search, filter, and inspect each role with AI match analysis, instructed cover letters, and direct application actions in one flow.
            </p>
          </div>
          <div className="toolbar-shell min-w-[320px]">
          <div className="flex flex-1 items-center gap-2 pl-2">
            <Search size={18} className="text-[var(--app-text-soft)]" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search roles or companies"
              placeholder="Search roles or companies…"
              className="w-full border-none bg-transparent py-2 text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && fetchJobs()}
            />
          </div>
          <button
            onClick={() => setShowFilters((current) => !current)}
            aria-label={showFilters ? "Hide Filters" : "Show Filters"}
            className={`rounded-xl p-2 ${
              showFilters ? "button-primary text-white" : "text-[var(--app-text-soft)] hover:bg-white"
            }`}
          >
            <Filter size={18} aria-hidden="true" />
          </button>
          <button
            onClick={fetchJobs}
            className="button-primary rounded-xl px-4 py-2 text-xs font-semibold"
          >
            Search
          </button>
        </div>
        </div>
      </header>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="section-shell overflow-hidden rounded-[2rem] p-6"
          >
            <div className="space-y-4">
              <div>
                <label className="ml-1 mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                  Required Skills / Qualifications
                </label>
                <input
                  type="text"
                  aria-label="Required skills or qualifications"
                  placeholder="e.g. React, TypeScript, 5+ years experience…"
                  className="field-shell w-full rounded-xl px-4 py-3 text-sm font-medium"
                  value={requirements}
                  onChange={(event) => setRequirements(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && fetchJobs()}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SelectField
                  label="Experience Level"
                  value={experienceLevel}
                  onChange={setExperienceLevel}
                  options={[
                    { value: "", label: "Any Level" },
                    { value: "ENTRY", label: "Entry" },
                    { value: "MID_LEVEL", label: "Mid-Level" },
                    { value: "SENIOR", label: "Senior" },
                    { value: "DIRECTOR", label: "Director" },
                  ]}
                />
                <SelectField
                  label="Work Mode"
                  value={workMode}
                  onChange={setWorkMode}
                  options={[
                    { value: "", label: "Any Mode" },
                    { value: "REMOTE", label: "Remote" },
                    { value: "HYBRID", label: "Hybrid" },
                    { value: "ONSITE", label: "Onsite" },
                  ]}
                />
                <SelectField
                  label="Company Size"
                  value={companySize}
                  onChange={setCompanySize}
                  options={[
                    { value: "", label: "Any Size" },
                    { value: "STARTUP", label: "Startup" },
                    { value: "MID_SIZE", label: "Mid-size" },
                    { value: "ENTERPRISE", label: "Enterprise" },
                  ]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="scrollbar-none -mx-2 flex gap-2 overflow-x-auto px-2 pb-2">
        {["All Roles", "Engineering", "Design", "Marketing", "Management", "Sales"].map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-full border px-5 py-2 text-xs font-semibold ${
              category === item
                ? "nav-link-luxury-active"
                : "status-chip hover:text-[var(--app-text)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          [1, 2, 3, 4].map((item) => <div key={item} className="panel-surface h-40 animate-pulse rounded-3xl" />)
        ) : jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="list-row transition-premium group flex flex-col justify-between rounded-[2rem] p-6 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(92,108,150,0.12)]"
            >
              <div>
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(70,102,255,0.08)] text-2xl font-semibold text-[var(--app-text-soft)]">
                    {job.company[0]}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[rgba(62,161,125,0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--app-success)]">
                      {(job.type || "FULL_TIME").replaceAll("_", " ")}
                    </span>
                    <button
                      onClick={(event) => handleToggleSave(job.id, event)}
                      aria-label={savedJobs.includes(job.id) ? "Remove Saved Job" : "Save Job"}
                      className="button-ghost rounded-full p-2 text-[var(--app-text-soft)] hover:text-[var(--app-accent)]"
                    >
                      <Bookmark
                        size={20}
                        className={savedJobs.includes(job.id) ? "fill-[var(--app-accent)] text-[var(--app-accent)]" : ""}
                      />
                    </button>
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold transition-premium group-hover:text-[var(--app-accent)]">
                  {job.title}
                </h3>
                <div className="mb-6 flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--app-text-muted)]">
                  {job.recruiterId ? (
                    <a
                      href={`/company/${job.recruiterId}`}
                      className="transition-premium flex items-center gap-1.5 hover:text-[var(--app-accent)]"
                    >
                      <Building size={14} aria-hidden="true" /> {job.company}
                    </a>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={14} aria-hidden="true" /> {job.company}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} aria-hidden="true" /> {job.location || "Remote"}
                  </div>
                  {job.experienceLevel && (
                    <div className="flex items-center gap-1.5">
                      <Star size={14} aria-hidden="true" /> {formatLabel(job.experienceLevel)}
                    </div>
                  )}
                </div>
                <p className="mb-8 line-clamp-2 text-sm leading-relaxed text-[var(--app-text-muted)]">
                  {job.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-[rgba(41,49,81,0.08)] pt-6">
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <DollarSign size={14} className="text-[var(--app-success)]" aria-hidden="true" />
                  {job.salary || "$80k - $120k"}
                </div>
                <button
                  onClick={() => handleMatch(job)}
                  className="button-secondary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  AI Match <Zap size={14} className="text-[var(--app-accent)]" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="section-shell lg:col-span-2 rounded-[2rem] py-20 text-center">
            <Search size={48} className="mx-auto mb-4 text-[var(--app-text-soft)]" aria-hidden="true" />
            <h3 className="mb-2 text-xl font-bold">No jobs found</h3>
            <p className="text-[var(--app-text-soft)]">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-[rgba(20,24,40,0.28)] backdrop-blur-sm"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="panel-surface-strong relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[3rem]"
            >
              <div className="gradient-surface flex items-center justify-between p-8 md:p-10">
                <div>
                  <div className="eyebrow mb-2 text-[var(--app-accent)]">Selected Role</div>
                  <h2 className="text-3xl font-semibold tracking-tight">{selectedJob.title}</h2>
                  <p className="mt-1 text-sm text-[var(--app-text-muted)]">{selectedJob.company}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  aria-label="Close Job Details"
                  className="button-secondary rounded-full p-2"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto p-10">
                <div>
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                    Job Description
                  </h3>
                  <p className="text-sm leading-8 text-[var(--app-text-muted)]">{selectedJob.description}</p>
                </div>

                {matching ? (
                  <div className="section-shell rounded-[2rem] py-12 text-center">
                    <Loader2 size={32} className="mx-auto mb-4 animate-spin text-[var(--app-accent)]" />
                    <h4 className="font-bold">AI is calculating your fit...</h4>
                    <p className="mt-1 text-xs text-[var(--app-text-soft)]">
                      Comparing your profile against the job requirements
                    </p>
                  </div>
                ) : matchResult ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="section-shell rounded-[2rem] p-8">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                            AI Match
                          </div>
                          <div className="text-6xl font-semibold leading-none text-[var(--app-accent)]">
                            {matchResult.score}%
                          </div>
                        </div>
                        <button
                          onClick={() => handleMatch(selectedJob, true)}
                          className="button-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-widest"
                        >
                          <RefreshCcw size={14} aria-hidden="true" /> Regenerate
                        </button>
                      </div>
                      <div className="mt-4 max-w-xl text-sm italic leading-7 text-[var(--app-text-muted)]">
                        "{matchResult.reasoning}"
                      </div>
                    </div>

                    {matchResult.missingKeywords?.length > 0 && (
                      <div className="rounded-2xl border border-[rgba(217,139,50,0.16)] bg-[rgba(217,139,50,0.08)] p-6">
                        <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-warning)]">
                          Optimization Tips (Add to resume)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.missingKeywords.map((keyword: string) => (
                            <span
                              key={keyword}
                              className="rounded-lg border border-[rgba(217,139,50,0.18)] bg-white px-3 py-1 text-[10px] font-semibold uppercase text-[var(--app-warning)]"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                        Fit Analysis
                      </h3>
                      <div className="section-shell rounded-2xl p-6 text-sm leading-8 text-[var(--app-text-muted)]">
                        {matchResult.fitAnalysis}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => handleMatch(selectedJob)}
                    className="button-primary flex w-full items-center justify-center gap-3 rounded-2xl py-6 font-semibold"
                  >
                    Calculate AI Match Score <Sparkles size={20} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="p-10 pt-0">
                <div className="section-shell mb-6 rounded-2xl p-6">
                  <label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                    <FileText size={16} aria-hidden="true" /> Cover Letter Instructions
                  </label>
                  <textarea
                    className="field-shell h-28 w-full resize-none rounded-2xl p-4 text-sm"
                    placeholder="Add keywords, tone, achievements, or special instructions for the AI cover letter…"
                    value={coverLetterInstructions}
                    onChange={(event) => setCoverLetterInstructions(event.target.value)}
                  />
                </div>

                {showCoverLetter ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={handleGenerateCoverLetter}
                        disabled={generatingLetter}
                        className="button-secondary flex-1 rounded-2xl py-4 text-sm font-semibold disabled:opacity-50"
                      >
                        {generatingLetter ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Regenerating…
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <RefreshCcw size={16} className="text-[var(--app-accent)]" aria-hidden="true" /> Regenerate with Instructions
                          </span>
                        )}
                      </button>
                    </div>
                    <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                      <ScrollText size={16} aria-hidden="true" /> Cover Letter (Review & Edit)
                    </h3>
                    <textarea
                      className="field-shell h-48 w-full resize-none rounded-2xl p-4 text-sm"
                      value={coverLetterText}
                      onChange={(event) => setCoverLetterText(event.target.value)}
                    />
                    <button
                      onClick={handleApply}
                      disabled={submittingApplication}
                      className="button-primary flex w-full items-center justify-center gap-2 rounded-2xl py-5 text-lg font-semibold disabled:opacity-50"
                    >
                      {submittingApplication ? (
                        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <>
                          Submit Application <ArrowRight size={20} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                      <button
                        onClick={handleGenerateCoverLetter}
                        disabled={generatingLetter}
                        className="button-secondary flex flex-1 items-center justify-center gap-2 rounded-2xl py-5 text-lg font-semibold disabled:opacity-50"
                      >
                        {generatingLetter ? (
                          <Loader2 className="animate-spin text-[var(--app-accent)]" size={20} aria-hidden="true" />
                        ) : (
                          <>
                            <FileText size={20} className="text-[var(--app-accent)]" aria-hidden="true" /> Generate AI Cover Letter
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleApply}
                        disabled={submittingApplication}
                        className="button-primary flex flex-1 items-center justify-center gap-2 rounded-2xl py-5 text-lg font-semibold disabled:opacity-50"
                      >
                        {submittingApplication ? (
                          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <>
                            Quick Apply <ArrowRight size={20} aria-hidden="true" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="section-shell rounded-2xl p-6">
                      <h4 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
                        <MessageSquareWarning size={16} aria-hidden="true" /> Job Feedback
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={feedbackText}
                          onChange={(event) => setFeedbackText(event.target.value)}
                          aria-label="Job feedback"
                          placeholder="Report an issue or share feedback on this listing…"
                          className="field-shell flex-1 rounded-xl px-4 py-2 text-sm"
                        />
                        <button
                          onClick={() => submitFeedback(selectedJob.id)}
                          disabled={submittingFeedback}
                          className="button-primary whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold"
                        >
                          {submittingFeedback ? (
                            <Loader2 className="animate-spin" size={14} aria-hidden="true" />
                          ) : (
                            "Submit"
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-shell w-full appearance-none rounded-xl px-4 py-3 text-sm font-medium"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((segment) => segment[0] + segment.slice(1).toLowerCase())
    .join(" ");
}
