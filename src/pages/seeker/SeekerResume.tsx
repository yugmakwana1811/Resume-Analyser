import { useState, useEffect } from "react";
import { User } from "../../App";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";
import { aiService } from "../../services/aiService";

export default function SeekerResume({ user }: { user: User }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [improvementResult, setImprovementResult] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/profile/${user?.id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load your profile.");
      }
      setProfile(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (!["application/pdf", "text/plain"].includes(file.type)) {
      alert("Please upload a PDF or TXT resume.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload a file smaller than 5 MB.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("profileId", profile.id);

    try {
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to upload your resume.");
      }
      const data = await response.json();
      setProfile((current: any) => ({ ...current, resume: data }));
      await handleAnalyze(data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (content?: string) => {
    const text = content || profile?.resume?.content;
    if (!text) return;

    setAnalyzing(true);
    try {
      const result = await aiService.analyzeResume(text);
      setAnalysisResult(result);

      const improvements = await aiService.improveResume(result);
      setImprovementResult(improvements);

      const response = await fetch(`/api/profile/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.name,
          headline: result.headline,
          skills: result.skills,
          experience: result.experience,
          education: result.education,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to save profile updates.");
      }
      await fetchProfile();
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="section-shell rounded-[2rem] p-6 text-sm text-[var(--app-text-muted)]">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="eyebrow mb-2">Resume Intelligence</div>
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
          Convert your resume into a higher-signal candidate profile.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
          Upload once, extract structured insights, and get AI-guided improvements aligned with current hiring patterns.
        </p>
      </header>

      <section
        className={`section-shell rounded-[2rem] border-2 border-dashed p-8 text-center ${
          profile?.resume ? "border-[rgba(62,161,125,0.25)]" : "border-[rgba(25,36,71,0.12)]"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <RefreshCw size={44} className="mb-3 animate-spin text-[var(--app-accent)]" />
            <p className="text-sm font-semibold">Uploading resume...</p>
          </div>
        ) : profile?.resume ? (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(62,161,125,0.15)] text-[var(--app-success)]">
              <CheckCircle size={30} />
            </div>
            <h3 className="text-xl font-semibold">Resume Uploaded</h3>
            <p className="mono mt-2 max-w-sm truncate text-xs text-[var(--app-text-soft)]">{profile.resume.id}.pdf</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <label className="button-primary cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold">
                Replace File
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt" />
              </label>
              <button
                onClick={() => handleAnalyze()}
                disabled={analyzing}
                className="button-secondary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Re-analyze
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(70,102,255,0.08)] text-[var(--app-accent)]">
              <Upload size={30} />
            </div>
            <h3 className="text-xl font-semibold">Upload your resume</h3>
            <p className="mt-2 text-sm text-[var(--app-text-soft)]">Supports PDF and TXT files up to 5MB.</p>
            <label className="button-primary mt-6 cursor-pointer rounded-xl px-6 py-3 text-sm font-semibold">
              Select Resume
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt" />
            </label>
          </div>
        )}
      </section>

      <AnimatePresence>
        {analyzing ? (
          <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="section-shell rounded-[2rem] p-10 text-center"
          >
            <div className="mx-auto mb-6 flex w-fit items-center gap-2">
              <div className="h-3 w-3 animate-bounce rounded-full bg-[var(--app-accent)] [animation-delay:-0.3s]" />
              <div className="h-3 w-3 animate-bounce rounded-full bg-[var(--app-accent)] [animation-delay:-0.15s]" />
              <div className="h-3 w-3 animate-bounce rounded-full bg-[var(--app-accent)]" />
            </div>
            <h3 className="text-2xl font-semibold">Analyzing your resume...</h3>
            <p className="mt-2 text-sm text-[var(--app-text-soft)]">
              Extracting skills, experience highlights, and improvement opportunities.
            </p>
          </motion.section>
        ) : null}

        {(analysisResult || improvementResult) && !analyzing ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"
          >
            <section className="section-shell space-y-5 rounded-[2rem] p-6">
              <div className="rounded-[1.5rem] bg-[rgba(25,36,71,0.94)] p-6 text-white">
                <div className="mono text-[11px] uppercase tracking-[0.2em] text-white/70">ATS Compatibility</div>
                <div className="mt-3 text-6xl font-semibold">{analysisResult?.atsScore || 0}%</div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisResult?.atsScore || 0}%` }}
                    transition={{ duration: 0.9 }}
                    className="h-full bg-[var(--app-accent)]"
                  />
                </div>
              </div>

              <div className="list-row p-4">
                <div className="mono mb-3 text-[11px] uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                  Top Skills Found
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysisResult?.skills?.map((skill: string, index: number) => (
                    <span key={`${skill}-${index}`} className="status-chip rounded-full px-3 py-1 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="list-row p-4">
                <div className="mono mb-3 text-[11px] uppercase tracking-[0.18em] text-[var(--app-text-soft)]">
                  Improvement Focus
                </div>
                <div className="space-y-3">
                  {analysisResult?.improvements?.slice(0, 3).map((improvement: string, index: number) => (
                    <div key={`${improvement}-${index}`} className="flex items-start gap-2 text-sm text-[var(--app-text-muted)]">
                      <AlertCircle size={14} className="mt-1 shrink-0 text-[var(--app-warning)]" />
                      <span>{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                <Sparkles size={18} className="text-[var(--app-accent)]" />
                Content Enhancements
              </h3>

              {improvementResult?.improvedBullets?.map((item: any, index: number) => (
                <div key={index} className="section-shell rounded-[1.8rem] p-5">
                  <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--app-text-soft)]">Current</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--app-text-soft)] line-through">{item.original}</p>
                  <hr className="my-4 border-[rgba(25,36,71,0.08)]" />
                  <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--app-success)]">Suggestion</div>
                  <p className="mt-2 text-sm font-semibold leading-7">{item.improved}</p>
                  <div className="mt-4 rounded-xl bg-[rgba(62,161,125,0.1)] p-3 text-xs leading-6 text-[var(--app-success)]">
                    <span className="mono block text-[10px] uppercase tracking-[0.16em]">Impact</span>
                    {item.reason}
                  </div>
                </div>
              ))}

              <div className="section-shell rounded-[1.8rem] p-5">
                <div className="mono mb-3 text-[11px] uppercase tracking-[0.18em] text-[var(--app-accent)]">
                  Strategic Skill Gaps
                </div>
                <p className="mb-4 text-sm leading-7 text-[var(--app-text-muted)]">
                  Adding these skills can improve interview conversion for your current target profile.
                </p>
                <div className="flex flex-wrap gap-2">
                  {improvementResult?.missingSkills?.map((skill: string, index: number) => (
                    <span key={`${skill}-${index}`} className="status-chip rounded-full px-3 py-1 text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
