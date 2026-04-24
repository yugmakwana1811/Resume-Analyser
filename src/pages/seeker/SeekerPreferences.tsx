import { useState, useEffect } from "react";
import { User } from "../../App";
import { Bell, Mail, Smartphone, Save, Loader2, Sparkles } from "lucide-react";
import { safeJsonParse } from "../../lib/utils";

export default function SeekerPreferences({ user }: { user: User }) {
  const [pref, setPref] = useState({
    emailAlerts: true,
    inAppAlerts: true,
    keywords: [] as string[],
    categories: [] as string[],
    workModes: [] as string[],
    experienceLevels: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    fetchPrefs();
  }, [user]);

  const fetchPrefs = async () => {
    try {
      const response = await fetch(`/api/preferences/${user?.id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load preferences.");
      }

      const data = await response.json();
      setPref({
        emailAlerts: data.emailAlerts ?? true,
        inAppAlerts: data.inAppAlerts ?? true,
        keywords: safeJsonParse<string[]>(data.keywords, []),
        categories: safeJsonParse<string[]>(data.categories, []),
        workModes: safeJsonParse<string[]>(data.workModes, []),
        experienceLevels: safeJsonParse<string[]>(data.experienceLevels, []),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const savePrefs = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/preferences/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pref),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to save preferences.");
      }
      alert("Preferences saved.");
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (field: keyof typeof pref, value: string) => {
    setPref((previous) => {
      const current = previous[field] as string[];
      if (current.includes(value)) {
        return { ...previous, [field]: current.filter((item) => item !== value) };
      }
      return { ...previous, [field]: [...current, value] };
    });
  };

  if (loading) {
    return <div className="section-shell rounded-[2rem] p-6 text-sm text-[var(--app-text-muted)]">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="page-hero overflow-hidden px-6 py-7 md:px-8 md:py-9">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-2">Preference Center</div>
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
              Tune your opportunity feed and alert cadence.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-text-muted)]">
              Keep recommendations aligned with your intent by refining role, work mode, and notification settings.
            </p>
          </div>
          <button
            onClick={savePrefs}
            disabled={saving}
            className="button-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
            Save Changes
          </button>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <Bell size={18} className="text-[var(--app-accent)]" aria-hidden="true" />
            Notifications
          </h2>
          <div className="space-y-3">
            <label className="list-row flex cursor-pointer items-center justify-between gap-3 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[rgba(70,102,255,0.1)] p-2 text-[var(--app-accent)]">
                  <Mail size={16} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Email Alerts</div>
                  <div className="text-sm text-[var(--app-text-muted)]">Receive relevant job matches in your inbox.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pref.emailAlerts}
                onChange={(event) => setPref({ ...pref, emailAlerts: event.target.checked })}
                className="h-5 w-5 accent-[var(--app-accent)]"
              />
            </label>

            <label className="list-row flex cursor-pointer items-center justify-between gap-3 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[rgba(70,102,255,0.1)] p-2 text-[var(--app-accent)]">
                  <Smartphone size={16} aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold">In-App Alerts</div>
                  <div className="text-sm text-[var(--app-text-muted)]">Get immediate dashboard notifications for new fit roles.</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pref.inAppAlerts}
                onChange={(event) => setPref({ ...pref, inAppAlerts: event.target.checked })}
                className="h-5 w-5 accent-[var(--app-accent)]"
              />
            </label>
          </div>
        </section>

        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <h2 className="mb-2 text-lg font-semibold">Target Keywords</h2>
          <p className="mb-5 text-sm text-[var(--app-text-muted)]">Add skills, technologies, or role terms to guide matching.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(event) => setNewKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && newKeyword.trim()) {
                  toggleArrayItem("keywords", newKeyword.trim());
                  setNewKeyword("");
                }
              }}
              className="field-shell flex-1 rounded-xl px-4 py-2.5 text-sm"
              placeholder="e.g. Next.js, Product Analytics..."
            />
            <button
              onClick={() => {
                if (newKeyword.trim()) {
                  toggleArrayItem("keywords", newKeyword.trim());
                  setNewKeyword("");
                }
              }}
              className="button-primary rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              Add
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {pref.keywords.map((keyword) => (
              <span key={keyword} className="status-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm">
                {keyword}
                <button
                  onClick={() => toggleArrayItem("keywords", keyword)}
                  className="button-ghost rounded-full px-1 text-[var(--app-text-soft)] hover:text-[var(--app-danger)]"
                  aria-label={`Remove keyword ${keyword}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </section>

        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <h2 className="mb-5 text-lg font-semibold">Work Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            {["Remote", "Hybrid", "Onsite"].map((mode) => (
              <button
                key={mode}
                onClick={() => toggleArrayItem("workModes", mode)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                  pref.workModes.includes(mode) ? "nav-link-luxury-active" : "button-secondary text-[var(--app-text-muted)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </section>

        <section className="section-shell rounded-[2rem] p-6 md:p-7">
          <h2 className="mb-5 text-lg font-semibold">Experience Level</h2>
          <div className="grid grid-cols-2 gap-3">
            {["Entry Level", "Mid Level", "Senior", "Director", "Executive"].map((level) => (
              <button
                key={level}
                onClick={() => toggleArrayItem("experienceLevels", level)}
                className={`rounded-xl px-3 py-3 text-sm font-semibold ${
                  pref.experienceLevels.includes(level)
                    ? "nav-link-luxury-active"
                    : "button-secondary text-[var(--app-text-muted)]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="gradient-surface rounded-[2rem] p-6 md:p-7">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-accent)]">
          <Sparkles size={16} aria-hidden="true" />
          AI Matching Engine
        </div>
        <p className="text-sm leading-8 text-[var(--app-text-muted)]">
          Saved preferences improve recommendation quality by weighting your role intent, work setup constraints, and seniority targets.
        </p>
      </section>
    </div>
  );
}
