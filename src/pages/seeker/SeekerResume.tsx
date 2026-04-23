import { useState, useEffect } from "react";
import { User } from "../../App";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, CheckCircle, RefreshCw, AlertCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
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
      const res = await fetch(`/api/profile/${user?.id}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load your profile.");
      }
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Unable to upload your resume.");
      }
      const data = await res.json();
      setProfile((current: any) => ({ ...current, resume: data }));
      await handleAnalyze(data.content);
    } catch (err) {
      console.error(err);
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
      
      // Also get improvements
      const improvements = await aiService.improveResume(result);
      setImprovementResult(improvements);

      // Save improved data to profile
      const response = await fetch(`/api/profile/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           name: result.name,
           headline: result.headline,
           skills: result.skills,
           experience: result.experience,
           education: result.education
        })
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to save your profile updates.");
      }
      await fetchProfile();
      
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="animate-pulse flex items-center justify-center p-20">Loading profile...</div>;

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Resume Intelligence</h1>
        <p className="text-[#141414]/60">Upload your resume to extract data and get AI-powered optimizations.</p>
      </header>

      {/* Upload Box */}
      <section className={`border-2 border-dashed ${profile?.resume ? 'border-green-500/20 bg-green-50/20' : 'border-[#141414]/10 bg-white'} p-12 rounded-[2rem] text-center transition-all`}>
        {uploading ? (
            <div className="flex flex-col items-center">
                <RefreshCw size={48} className="animate-spin text-[#141414]/20 mb-4" />
                <p className="font-bold">Uploading resume...</p>
            </div>
        ) : profile?.resume ? (
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Resume Uploaded</h3>
                <p className="text-sm text-[#141414]/60 mb-6 font-mono max-w-sm truncate">{profile.resume.id}.pdf</p>
                <div className="flex gap-4">
                    <label className="px-6 py-3 bg-[#141414] text-[#F5F5F0] rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">
                        Replace File
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt" />
                    </label>
                    <button 
                        onClick={() => handleAnalyze()}
                        disabled={analyzing}
                        className="px-6 py-3 border border-[#141414]/10 bg-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#F5F5F0] transition-colors disabled:opacity-50"
                    >
                        {analyzing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Re-analyze
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#F5F5F0] text-[#141414]/40 rounded-2xl flex items-center justify-center mb-6">
                    <Upload size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Click to upload or drag & drop</h3>
                <p className="text-sm text-[#141414]/40 mb-8">Supports PDF and TXT files</p>
                <label className="px-8 py-4 bg-[#141414] text-[#F5F5F0] rounded-2xl font-bold cursor-pointer hover:scale-105 transition-transform inline-block">
                    Select Resume
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt" />
                </label>
            </div>
        )}
      </section>

      {/* Analysis Results */}
      <AnimatePresence>
        {analyzing && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-12 rounded-[2rem] border border-[#141414]/5 text-center"
            >
                <div className="flex space-x-2 justify-center items-center mb-6">
                    <div className="h-4 w-4 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-4 w-4 bg-[#F27D26] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-4 w-4 bg-[#F27D26] rounded-full animate-bounce"></div>
                </div>
                <h3 className="text-2xl font-bold mb-2">AI is analyzing your professional identity...</h3>
                <p className="text-[#141414]/40">Extracting skills, experience, and looking for growth opportunities.</p>
            </motion.div>
        )}

        {(analysisResult || improvementResult) && !analyzing && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-3 gap-8"
            >
                {/* Score & Insights */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-[#141414] text-[#F5F5F0] p-8 rounded-[2rem]">
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mb-4">ATS Compatibility</div>
                        <div className="text-7xl font-bold mb-4">{analysisResult?.atsScore || 0}%</div>
                        <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${analysisResult?.atsScore || 0}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-[#F27D26]"
                            />
                        </div>
                        <div className="space-y-4">
                            {analysisResult?.improvements?.slice(0, 3).map((imp: string, i: number) => (
                                <div key={i} className="flex gap-2 text-sm opacity-80">
                                    <AlertCircle size={16} className="text-[#F27D26] shrink-0 mt-1" />
                                    <span>{imp}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-[#141414]/5">
                        <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-[#141414]/40">Top Skills Found</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysisResult?.skills?.map((skill: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-[#F5F5F0] rounded-lg text-xs font-bold">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Improvements List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Sparkles size={20} className="text-[#F27D26]" />
                        Content Enhancements
                    </h3>
                    
                    {improvementResult?.improvedBullets?.map((item: any, i: number) => (
                        <div key={i} className="bg-white rounded-3xl p-6 border border-[#141414]/5 space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">
                                <span className="text-red-400">Current</span>
                            </div>
                            <p className="text-sm opacity-40 line-through leading-relaxed">{item.original}</p>
                            
                            <hr className="border-[#141414]/5" />
                            
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-500">
                                <Sparkles size={12} /> Suggestions
                            </div>
                            <p className="text-sm font-bold leading-relaxed">{item.improved}</p>
                            
                            <div className="bg-green-50/50 p-4 rounded-xl text-[10px] text-green-700 font-medium">
                                <span className="font-bold uppercase tracking-widest opacity-60 block mb-1">Impact:</span>
                                {item.reason}
                            </div>
                        </div>
                    ))}

                    <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2rem]">
                        <h4 className="font-bold text-blue-900 mb-4 uppercase tracking-widest text-xs">Strategic Skill Gaps</h4>
                        <p className="text-sm text-blue-800 opacity-80 mb-6 leading-relaxed">Based on current market trends for your profile, adding these skills could double your interview rate:</p>
                        <div className="flex flex-wrap gap-2">
                            {improvementResult?.missingSkills?.map((skill: string, i: number) => (
                                <span key={i} className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl text-xs font-bold shadow-sm">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
