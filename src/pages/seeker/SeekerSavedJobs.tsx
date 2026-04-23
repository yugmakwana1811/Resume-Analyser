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
      const res = await fetch(`/api/saved-jobs/${user?.id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load saved jobs.");
      }
      const data = await res.json();
      setSavedJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId: string, savedJobId: string) => {
    try {
      const res = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, jobId })
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Unable to update saved jobs.");
      }
      setSavedJobs(prev => prev.filter(sj => sj.id !== savedJobId));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Saved Jobs</h1>
        <p className="text-[#141414]/60">Your bookmarked career opportunities.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse"></div>)
        ) : savedJobs.length > 0 ? (
            savedJobs.map(({ id: savedJobId, job }) => (
                <div 
                    key={savedJobId} 
                    className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 hover:shadow-xl hover:shadow-[#141414]/5 transition-all flex flex-col justify-between"
                >
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-[#F5F5F0] rounded-2xl flex items-center justify-center font-bold text-2xl text-[#141414]/20">
                                {job.company[0]}
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] uppercase font-bold tracking-widest rounded-full">{job.type || 'Full Time'}</span>
                                <button onClick={() => handleToggleSave(job.id, savedJobId)} className="text-[#F27D26] hover:text-red-500 transition-colors p-1" title="Remove from saved">
                                    <BookmarkMinus size={20} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-[#141414]/40 mb-6 font-medium">
                            <div className="flex items-center gap-1.5"><Briefcase size={14} /> {job.company}</div>
                            <div className="flex items-center gap-1.5"><MapPin size={14} /> {job.location || 'Remote'}</div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-[#141414]/5">
                        <div className="flex items-center gap-1.5 text-sm font-bold">
                            <DollarSign size={14} className="text-green-600" /> {job.salary || '$80k - $120k'}
                        </div>
                        <Link 
                            to={`/dashboard/jobs?id=${job.id}`}
                            className="flex items-center gap-2 text-sm font-bold bg-[#141414] text-[#F5F5F0] px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            View Job <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            ))
        ) : (
            <div className="lg:col-span-2 py-20 bg-white rounded-[2rem] border border-[#141414]/5 text-center">
                <BookmarkMinus size={48} className="mx-auto text-[#141414]/10 mb-4" />
                <h3 className="text-xl font-bold mb-2">No saved jobs</h3>
                <p className="text-[#141414]/40">Jobs you bookmark will appear here.</p>
            </div>
        )}
      </div>
    </div>
  );
}
