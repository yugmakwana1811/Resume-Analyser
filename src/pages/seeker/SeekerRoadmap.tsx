import { useState, useEffect } from "react";
import { User } from "../../App";
import { motion, AnimatePresence } from "motion/react";
import { Map, ArrowRight, Zap, Loader2, Target, Calendar, ListChecks, Sparkles } from "lucide-react";
import { aiService } from "../../services/aiService";

export default function SeekerRoadmap({ user }: { user: User }) {
  const [targetRole, setTargetRole] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${user?.id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load your profile.");
      }
      setProfile(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleGenerate = async () => {
    if (!profile || !targetRole) return;
    setGenerating(true);
    try {
      const result = await aiService.generateRoadmap(targetRole, profile);
      setRoadmap(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Career Roadmap</h1>
        <p className="text-[#141414]/60">Where do you want to be in 2 years? We'll show you the exact steps to get there.</p>
      </header>

      {/* Input Section */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-[#141414]/5">
         <div className="max-w-xl">
            <label className="block text-xs uppercase font-bold tracking-[0.2em] text-[#141414]/40 mb-3 ml-1">Target Professional Role</label>
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-[#141414]/20" size={20} />
                    <input 
                        type="text" 
                        placeholder="e.g. Senior Frontend Architect, Product Manager"
                        className="w-full pl-12 pr-4 py-4 bg-[#F5F5F0] rounded-2xl border-none outline-none font-medium focus:ring-2 focus:ring-[#141414] transition-all"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={generating || !targetRole}
                    className="px-8 py-4 bg-[#141414] text-[#F5F5F0] rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {generating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} className="text-[#F27D26]" />}
                    {generating ? 'Generating...' : 'Build Path'}
                </button>
            </div>
         </div>
      </section>

      {/* Roadmap Content */}
      <AnimatePresence>
        {generating && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-20 text-center bg-white rounded-[3rem] border border-[#141414]/5"
            >
                <div className="w-16 h-16 bg-[#F5F5F0] rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={32} className="text-[#F27D26] animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Analyzing skill gaps and industry trends...</h3>
                <p className="text-[#141414]/40 text-sm">Our AI is drafting your personalized transformation plan.</p>
            </motion.div>
        )}

        {roadmap && !generating && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
            >
                <div className="bg-[#141414] text-[#F5F5F0] p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mb-3">Roadmap Summary</div>
                        <h2 className="text-4xl font-bold tracking-tight">Path to {targetRole}</h2>
                        <p className="text-[#F5F5F0]/60 mt-2">Total estimated duration: <span className="text-[#F27D26] font-bold">{roadmap.totalEstimatedTime}</span></p>
                    </div>
                </div>

                <div className="relative pl-8 md:pl-12 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#F27D26] before:to-transparent">
                    {roadmap.steps?.map((step: any, i: number) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative"
                        >
                            {/* Dot */}
                            <div className="absolute -left-[33px] md:-left-[49px] top-1 w-4 h-4 rounded-full border-4 border-[#F5F5F0] bg-[#F27D26] shadow-md shadow-[#F27D26]/20"></div>

                            <div className="bg-white p-8 rounded-[2rem] border border-[#141414]/5 hover:border-[#141414]/10 transition-colors shadow-sm">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#F27D26] mb-1">Step {i + 1}</div>
                                        <h3 className="text-xl font-bold">{step.milestone}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F0] rounded-xl text-[10px] font-bold uppercase tracking-tight">
                                        <Calendar size={12} className="text-[#141414]/40" />
                                        {step.duration}
                                    </div>
                                </div>
                                
                                <p className="text-sm text-[#141414]/60 mb-6 leading-relaxed">{step.description}</p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                                        <ListChecks size={14} /> Skills to Master
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {step.skillsToLearn?.map((skill: string, j: number) => (
                                            <span key={j} className="px-3 py-1 bg-[#141414]/5 text-[#141414] rounded-lg text-xs font-bold hover:bg-[#F27D26] hover:text-[#141414] transition-all cursor-default">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-white border border-[#141414]/5 p-12 rounded-[3rem] text-center">
                    <h4 className="text-xl font-bold mb-4">Start your journey today</h4>
                    <p className="text-[#141414]/60 text-sm mb-8 max-w-lg mx-auto leading-relaxed">Consistency is key. Focus on one milestone at a time and update your progress to see the roadmap evolve.</p>
                    <button className="px-10 py-4 bg-[#141414] text-[#F5F5F0] rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                        Track Progress <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
