import { useEffect, useState } from "react";
import { User } from "../../App";
import { AnimatePresence, motion } from "motion/react";
import {
  Bot,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  History,
  MessageSquare,
  Send,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { aiService } from "../../services/aiService";

export default function SeekerTracker({ user }: { user: User }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewApp, setInterviewApp] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    fetchProfile();
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${user?.id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load your profile.");
      }
      setProfile(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${user?.id}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Unable to load your applications.");
      }
      setApplications(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startInterview = (application: any) => {
    setInterviewApp(application);
    setChatHistory([
      {
        role: "model",
        text: `Hi there! I'm your AI interviewer for the ${application.job.title} role at ${application.job.company}. Ready to get started with a few practice interview questions?`,
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !profile) return;

    const userMessage = { role: "user", text: chatInput };
    const nextHistory = [...chatHistory, userMessage];
    setChatHistory(nextHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const responseText = await aiService.generateInterviewResponse(interviewApp.job, profile, nextHistory);
      setChatHistory([...nextHistory, { role: "model", text: responseText }]);
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "SHORTLISTED":
        return "bg-green-50 text-green-600 border-green-100";
      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <Clock size={14} />;
      case "SHORTLISTED":
        return <CheckCircle2 size={14} />;
      case "REJECTED":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="eyebrow mb-2">Application Timeline</div>
        <h1 className="mb-2 text-4xl font-semibold tracking-[-0.04em]">My Applications</h1>
        <p className="text-[var(--app-text-muted)]">
          Track every submission and review the full history of status changes for each role.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="panel-surface h-24 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((application: any) => {
            const isExpanded = expandedApplicationId === application.id;

            return (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="panel-surface rounded-2xl transition-colors"
              >
                <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(93,107,255,0.08)] text-xl font-semibold text-[var(--app-text-soft)]">
                      {application.job.company[0]}
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-bold">{application.job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--app-text-muted)]">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={14} /> {application.job.company}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} /> Applied{" "}
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                    <div
                      className={`hidden items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-widest sm:flex ${getStatusColor(application.status)}`}
                    >
                      {getStatusIcon(application.status)}
                      {application.status}
                    </div>
                    <button
                      onClick={() => startInterview(application)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      <MessageSquare size={14} /> Mock Interview
                    </button>
                    <button
                      onClick={() =>
                        setExpandedApplicationId((current) =>
                          current === application.id ? null : application.id,
                        )
                      }
                      className="button-secondary flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-all"
                    >
                      <History size={14} />
                      View History
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-[rgba(41,49,81,0.08)]"
                    >
                      <div className="space-y-4 p-6">
                        {application.statusHistory?.map((entry: any, index: number) => (
                          <div key={entry.id || `${application.id}-${index}`} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border ${getStatusColor(entry.status)}`}
                              >
                                {getStatusIcon(entry.status)}
                              </div>
                              {index !== application.statusHistory.length - 1 && (
                                <div className="mt-2 h-full w-px bg-[#141414]/10" />
                              )}
                            </div>
                            <div className="pb-4">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold">{entry.status}</span>
                                <span className="text-xs text-[var(--app-text-soft)]">
                                  {new Date(entry.changedAt).toLocaleString()}
                                </span>
                              </div>
                              {entry.note && (
                                <p className="text-sm leading-relaxed text-[var(--app-text-muted)]">{entry.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="panel-surface rounded-[3rem] py-24 text-center">
          <ClipboardList size={48} className="mx-auto mb-6 text-[var(--app-text-soft)]" />
          <h3 className="mb-2 text-xl font-bold">No applications yet</h3>
          <p className="mx-auto max-w-sm text-[var(--app-text-soft)]">
            Start matching and applying to roles to see your application timeline here.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        <StatSummary label="Total" count={applications.length} color="bg-white" />
        <StatSummary
          label="Pending"
          count={applications.filter((application) => application.status === "PENDING").length}
          color="bg-orange-50/50"
          textColor="text-orange-600"
        />
        <StatSummary
          label="Shortlisted"
          count={applications.filter((application) => application.status === "SHORTLISTED").length}
          color="bg-green-50/50"
          textColor="text-green-600"
        />
        <StatSummary
          label="Rejected"
          count={applications.filter((application) => application.status === "REJECTED").length}
          color="bg-red-50/50"
          textColor="text-red-600"
        />
      </div>

      <AnimatePresence>
        {interviewApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          >
            <div
              className="absolute inset-0 bg-[#141414]/40 backdrop-blur-sm"
              onClick={() => setInterviewApp(null)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="panel-surface-strong relative z-10 flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[3rem]"
            >
              <div className="gradient-surface flex shrink-0 items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(93,107,255,0.12)] text-[var(--app-accent)]">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">AI Interview Coach</h2>
                    <p className="text-xs text-[var(--app-text-muted)]">
                      Practicing for {interviewApp.job.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInterviewApp(null)}
                  className="hidden rounded-full p-2 transition-colors hover:bg-white/70 sm:block"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex max-w-[85%] gap-4 ${message.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === "user"
                          ? "bg-[#141414] text-white"
                          : "bg-[rgba(93,107,255,0.12)] text-[var(--app-accent)]"
                      }`}
                    >
                      {message.role === "user" ? <UserIcon size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                        message.role === "user"
                          ? "rounded-tr-none bg-[linear-gradient(135deg,var(--app-accent),var(--app-secondary))] text-white"
                          : "rounded-tl-none border border-[rgba(41,49,81,0.08)] bg-white"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex max-w-[80%] gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(93,107,255,0.12)] text-[var(--app-accent)]">
                      <Bot size={14} />
                    </div>
                    <div className="flex h-12 items-center gap-1 rounded-2xl rounded-tl-none border border-[rgba(41,49,81,0.08)] bg-white p-4 text-sm text-[var(--app-text-soft)]">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                      <div
                        className="h-2 w-2 animate-pulse rounded-full bg-current"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="h-2 w-2 animate-pulse rounded-full bg-current"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-[rgba(41,49,81,0.08)] bg-white/82 p-4">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleSendMessage()}
                    placeholder="Type your response..."
                    className="field-shell w-full rounded-xl py-4 pl-4 pr-12 text-sm font-medium transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="button-primary absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-white transition-all disabled:opacity-50"
                  >
                    <Send size={16} className="-ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatSummary({
  label,
  count,
  color,
  textColor,
}: {
  label: string;
  count: number;
  color: string;
  textColor?: string;
}) {
  return (
    <div className={`panel-surface rounded-2xl p-6 ${color}`}>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-text-soft)]">
        {label}
      </div>
      <div className={`text-4xl font-semibold ${textColor || "text-[var(--app-text)]"}`}>{count}</div>
    </div>
  );
}
