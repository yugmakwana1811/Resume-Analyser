import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Briefcase, GraduationCap, Award, MapPin, Share2, Download } from "lucide-react";
import { safeJsonParse } from "../lib/utils";

export default function PublicProfile() {
    const { userId } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/profile/${userId}`);
                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.error || "Unable to load this profile.");
                }

                setProfile(await response.json());
            } catch (err: any) {
                setError(err.message || "Unable to load this profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="app-shell flex min-h-screen items-center justify-center px-6">
                <div className="section-shell rounded-[2rem] px-8 py-6 text-center">
                    <div className="eyebrow mb-2">Public Profile</div>
                    <div className="text-sm font-semibold text-[var(--app-text-muted)]">Accessing profile registry…</div>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="app-shell flex min-h-screen items-center justify-center px-6">
                <div className="section-shell max-w-xl rounded-[2rem] px-8 py-7 text-center">
                    <div className="eyebrow mb-2">Unable to Load</div>
                    <div className="text-base font-semibold">{error}</div>
                </div>
            </div>
        );
    }

    // Sample data fallback for the recruiter demo
    const fallbackExperience = [{
        title: "Senior Technical Lead",
        company: "Tech Giant Corp",
        period: "2022 - Present",
        description: "Orchestrated the migration of legacy architecture to modern microservices, resulting in 40% performance improvement."
    }];
    const fallbackEducation = [{
        institution: "Stanford University",
        degree: "M.S. Computer Science",
        year: "2020"
    }];
    const d = {
        name: profile?.name || "Professional Identity",
        headline: profile?.headline || "Software Engineering Excellence",
        bio: profile?.bio || "Highly motivated professional with extensive experience in developing scalable distributed systems and leading cross-functional teams.",
        skills: safeJsonParse<string[]>(profile?.skills, ["System Design", "Cloud Infrastructure", "Rapid Prototyping"]),
        experience: safeJsonParse<any[]>(profile?.experience, fallbackExperience),
        education: safeJsonParse<any[]>(profile?.education, fallbackEducation)
    };

    return (
        <div className="app-shell min-h-screen">
            {/* Split Header */}
            <div className="grid lg:grid-cols-2">
                <div className="gradient-surface flex flex-col justify-center p-12 md:p-24">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="brand-mark h-12 w-12 rounded-2xl"></div>
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--app-text-soft)] font-mono">Profile // verified</div>
                    </div>
                    <h1 className="mb-8 text-6xl font-semibold uppercase leading-[0.85] tracking-tight md:text-8xl">
                        {d.name.split(' ')[0]} <br />
                        <span className="text-[var(--app-accent)]">{d.name.split(' ')[1] || ''}</span>
                    </h1>
                    <p className="mb-12 text-2xl font-light text-[var(--app-text-muted)]">{d.headline}</p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    await navigator.clipboard.writeText(window.location.href);
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            className="button-primary flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all"
                        >
                            Copy Profile Link <Share2 size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="button-secondary flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all"
                        >
                            Save as PDF <Download size={16} />
                        </button>
                    </div>
                </div>

                <div className="p-12 md:p-24 flex flex-col justify-center space-y-16">
                    <section>
                        <h2 className="mb-8 border-b border-[rgba(41,49,81,0.08)] pb-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--app-text-soft)]">
                            Professional Synopsis
                        </h2>
                        <p className="text-xl leading-relaxed text-[var(--app-text-muted)] italic">"{d.bio}"</p>
                    </section>

                    <section>
                        <h2 className="mb-8 border-b border-[rgba(41,49,81,0.08)] pb-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--app-text-soft)]">
                            Core Competencies
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {d.skills.map((skill: string, i: number) => (
                                <span key={i} className="panel-muted rounded-xl px-5 py-2 text-xs font-semibold uppercase tracking-widest">{skill}</span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Main Content Body */}
            <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-3 gap-24">
                <div className="lg:col-span-2 space-y-24">
                    <section>
                        <h2 className="mb-12 flex items-center gap-4 text-3xl font-semibold tracking-tight">
                            <Briefcase size={28} className="text-[var(--app-accent)]" /> Career Timeline
                        </h2>
                        <div className="relative space-y-16 pl-10 before:absolute before:bottom-4 before:left-0 before:top-4 before:w-px before:bg-[rgba(41,49,81,0.14)]">
                            {d.experience.map((exp: any, i: number) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[44px] top-1.5 h-2 w-2 rounded-full bg-[var(--app-accent)]"></div>
                                    <div className="flex flex-col md:flex-row justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{exp.title}</h3>
                                            <p className="text-[var(--app-accent)] font-semibold text-sm uppercase tracking-widest">{exp.company}</p>
                                        </div>
                                        <div className="text-sm font-mono opacity-40">{exp.period}</div>
                                    </div>
                                    <p className="text-[var(--app-text-muted)] leading-relaxed text-sm">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="mb-12 flex items-center gap-4 text-3xl font-semibold tracking-tight">
                            <GraduationCap size={28} className="text-[var(--app-accent)]" /> Academic History
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {d.education.map((edu: any, i: number) => (
                                <div key={i} className="panel-surface rounded-[2rem] p-8">
                                    <h3 className="font-bold text-lg mb-1">{edu.degree}</h3>
                                    <p className="mb-4 text-sm text-[var(--app-text-muted)]">{edu.institution}</p>
                                    <div className="inline-block rounded-md bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest shadow-sm">
                                        Class of {edu.year}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-32 space-y-8">
                        <div className="panel-surface rounded-[2rem] p-8">
                            <h4 className="mb-8 text-xs font-semibold uppercase tracking-[0.2em]">Share Knowledge</h4>
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(window.location.href);
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    className="button-secondary group flex w-full items-center justify-between rounded-xl p-4 transition-all"
                                >
                                    <span className="font-bold text-sm">Copy Profile Link</span>
                                    <Share2 size={18} className="opacity-20 group-hover:opacity-100" />
                                </button>
                                <div className="rounded-xl border border-[rgba(72,105,255,0.16)] bg-[rgba(72,105,255,0.06)] p-4">
                                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                                        <Award size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Endorsed</span>
                                    </div>
                                    <p className="text-[10px] leading-relaxed text-[var(--app-text-muted)]">
                                        Verified skills based on project assessments and career achievements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="panel-surface rounded-[2rem] p-8">
                            <h4 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]">Location</h4>
                            <div className="flex items-center gap-2 text-sm font-medium text-[var(--app-text-muted)]">
                                <MapPin size={16} /> San Francisco, CA (Open to Remote)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
