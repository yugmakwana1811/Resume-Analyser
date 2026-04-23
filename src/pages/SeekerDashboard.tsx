import { Routes, Route, Link, useLocation } from "react-router-dom";
import { User } from "../App";
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  Map, 
  ClipboardList, 
  Bookmark,
  Settings,
  Zap
} from "lucide-react";
import SeekerOverview from "./seeker/SeekerOverview";
import SeekerResume from "./seeker/SeekerResume";
import SeekerJobs from "./seeker/SeekerJobs";
import SeekerSavedJobs from "./seeker/SeekerSavedJobs";
import SeekerRoadmap from "./seeker/SeekerRoadmap";
import SeekerTracker from "./seeker/SeekerTracker";
import SeekerPreferences from "./seeker/SeekerPreferences";

interface SeekerDashboardProps {
  user: User;
}

export default function SeekerDashboard({ user }: SeekerDashboardProps) {
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="app-shell flex h-[calc(100vh-76px)]">
      {/* Sidebar */}
      <aside className="app-sidebar hidden w-72 flex-col lg:flex">
        <div className="p-6">
          <div className="accent-surface mb-8 rounded-[1.6rem] p-5">
            <div className="eyebrow mb-2">Signed in as</div>
            <div className="truncate text-sm font-semibold text-[var(--app-text)]">{user.email}</div>
          </div>

          <nav className="space-y-1">
            <SidebarLink 
              to="/dashboard" 
              active={location.pathname === "/dashboard" || location.pathname === "/dashboard/overview"}
              icon={<LayoutDashboard size={20} />} 
              label="Overview" 
            />
            <SidebarLink 
              to="/dashboard/resume" 
              active={location.pathname === "/dashboard/resume"}
              icon={<FileText size={20} />} 
              label="Resume" 
            />
            <SidebarLink 
              to="/dashboard/jobs" 
              active={location.pathname === "/dashboard/jobs"}
              icon={<Search size={20} />} 
              label="Job Matches" 
            />
            <SidebarLink 
              to="/dashboard/saved" 
              active={location.pathname === "/dashboard/saved"}
              icon={<Bookmark size={20} />} 
              label="Saved Jobs" 
            />
            <SidebarLink 
              to="/dashboard/roadmap" 
              active={location.pathname === "/dashboard/roadmap"}
              icon={<Map size={20} />} 
              label="AI Roadmap" 
            />
            <SidebarLink 
              to="/dashboard/tracker" 
              active={location.pathname === "/dashboard/tracker"}
              icon={<ClipboardList size={20} />} 
              label="Applications" 
            />
            <SidebarLink 
              to="/dashboard/preferences" 
              active={location.pathname === "/dashboard/preferences"}
              icon={<Settings size={20} />} 
              label="Preferences" 
            />
          </nav>
        </div>

        <div className="mt-auto border-t border-[rgba(41,49,81,0.08)] p-6">
            <div className="gradient-surface rounded-[1.7rem] p-5">
                <div className="mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-[var(--app-accent)]" />
                    <span className="eyebrow text-[var(--app-accent)]">Pro Status</span>
                </div>
                <p className="mb-3 text-xs leading-relaxed text-[var(--app-text-muted)]">
                  Unlock advanced AI analysis and unlimited matches.
                </p>
                <button className="button-primary w-full rounded-xl py-2.5 text-xs font-semibold transition-all">
                    Upgrade Now
                </button>
            </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="app-workspace flex-1 overflow-y-auto p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Routes>
            <Route path="/" element={<SeekerOverview user={user} />} />
            <Route path="/overview" element={<SeekerOverview user={user} />} />
            <Route path="/resume" element={<SeekerResume user={user} />} />
            <Route path="/jobs" element={<SeekerJobs user={user} />} />
            <Route path="/saved" element={<SeekerSavedJobs user={user} />} />
            <Route path="/roadmap" element={<SeekerRoadmap user={user} />} />
            <Route path="/tracker" element={<SeekerTracker user={user} />} />
            <Route path="/preferences" element={<SeekerPreferences user={user} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 rounded-[1rem] px-4 py-3 text-sm font-semibold transition-all ${
        active 
          ? "nav-link-luxury-active"
          : "nav-link-luxury"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
