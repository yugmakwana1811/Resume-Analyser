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
    experienceLevels: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    fetchPrefs();
  }, [user]);

  const fetchPrefs = async () => {
    try {
      const res = await fetch(`/api/preferences/${user?.id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load preferences.");
      }
      const data = await res.json();
      setPref({
        emailAlerts: data.emailAlerts ?? true,
        inAppAlerts: data.inAppAlerts ?? true,
        keywords: safeJsonParse<string[]>(data.keywords, []),
        categories: safeJsonParse<string[]>(data.categories, []),
        workModes: safeJsonParse<string[]>(data.workModes, []),
        experienceLevels: safeJsonParse<string[]>(data.experienceLevels, [])
      });
    } catch (err) {
      console.error(err);
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
        body: JSON.stringify(pref)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to save preferences.");
      }
      alert("Preferences saved successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (field: keyof typeof pref, value: string) => {
    setPref(prev => {
      const arr = prev[field] as string[];
      if (arr.includes(value)) return { ...prev, [field]: arr.filter(v => v !== value) };
      return { ...prev, [field]: [...arr, value] };
    });
  };

  if (loading) return <div>Loading preferences...</div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="eyebrow mb-2">Preference Center</div>
          <h1 className="mb-2 text-4xl font-semibold tracking-[-0.04em]">Job Preferences</h1>
          <p className="text-[var(--app-text-muted)]">Customize how and when you get notified about new opportunities.</p>
        </div>
        <button 
          onClick={savePrefs}
          disabled={saving}
          className="button-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Changes
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="panel-surface rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Bell size={20} className="text-[#F27D26]" /> Notifications</h3>
            
            <label className="panel-muted flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(93,107,255,0.1)] text-[var(--app-accent)]"><Mail size={18} /></div>
                <div>
                  <div className="font-bold">Email Alerts</div>
                  <div className="text-xs text-[#141414]/60">Get highly-relevant job matches delivered to your inbox.</div>
                </div>
              </div>
              <input type="checkbox" checked={pref.emailAlerts} onChange={e => setPref({...pref, emailAlerts: e.target.checked})} className="w-5 h-5 accent-[#F27D26]" />
            </label>

            <label className="panel-muted flex cursor-pointer items-center justify-between rounded-2xl p-4 transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(93,107,255,0.1)] text-[var(--app-accent)]"><Smartphone size={18} /></div>
                <div>
                  <div className="font-bold">In-App Notifications</div>
                  <div className="text-xs text-[#141414]/60">Get instant pings on your dashboard when recruiters post.</div>
                </div>
              </div>
              <input type="checkbox" checked={pref.inAppAlerts} onChange={e => setPref({...pref, inAppAlerts: e.target.checked})} className="w-5 h-5 accent-[#F27D26]" />
            </label>
          </div>

          <div className="panel-surface rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">Target Keywords</h3>
            <p className="text-xs text-[#141414]/60 -mt-4 mb-4">Add skills, job titles, or specific technologies.</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newKeyword}
                onChange={e => setNewKeyword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newKeyword) {
                    toggleArrayItem('keywords', newKeyword.trim());
                    setNewKeyword("");
                  }
                }}
                className="field-shell flex-1 rounded-xl px-4 py-2"
                placeholder="e.g. Next.js"
              />
              <button 
                onClick={() => {
                  if (newKeyword) {
                    toggleArrayItem('keywords', newKeyword.trim());
                    setNewKeyword("");
                  }
                }}
                className="button-primary rounded-xl px-4 py-2 font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {pref.keywords.map(kw => (
                <span key={kw} className="panel-muted flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold">
                  {kw} 
                  <button onClick={() => toggleArrayItem('keywords', kw)} className="text-[#141414]/40 hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-surface rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-6">Work Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Remote", "Hybrid", "Onsite"].map(mode => (
                <button 
                  key={mode}
                  onClick={() => toggleArrayItem('workModes', mode)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all ${pref.workModes.includes(mode) ? 'nav-link-luxury-active' : 'button-secondary text-[var(--app-text-muted)]'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-surface rounded-3xl p-8">
            <h3 className="text-lg font-bold mb-6">Experience Level</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Entry Level", "Mid Level", "Senior", "Director", "Executive"].map(level => (
                <button 
                  key={level}
                  onClick={() => toggleArrayItem('experienceLevels', level)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition-all ${pref.experienceLevels.includes(level) ? 'nav-link-luxury-active' : 'button-secondary text-[var(--app-text-muted)]'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="gradient-surface rounded-3xl p-8">
             <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-[var(--app-accent)]"><Sparkles size={16}/> AI Auto-Matching</div>
             <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">
               With your preferences saved, our matching engine will continuously background-scan the marketplace and alert you within minutes if a "unicorn" role opens up that perfectly matches your criteria.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
