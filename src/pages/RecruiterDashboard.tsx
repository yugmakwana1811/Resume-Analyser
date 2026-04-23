import { Routes, Route, Link, useLocation } from "react-router-dom";
import { User } from "../App";
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Settings,
  Plus
} from "lucide-react";
import RecruiterOverview from "./recruiter/RecruiterOverview";
import RecruiterJobs from "./recruiter/RecruiterJobs";
import RecruiterCandidates from "./recruiter/RecruiterCandidates";

interface RecruiterDashboardProps {
  user: User;
}

export default function RecruiterDashboard({ user }: RecruiterDashboardProps) {
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="app-shell flex h-[calc(100vh-76px)]">
      {/* Sidebar */}
      <aside className="app-sidebar hidden w-72 flex-col lg:flex">
        <div className="p-6">
          <div className="accent-surface mb-8 rounded-[1.6rem] p-5">
            <div className="eyebrow mb-2 text-[var(--app-accent)]">Recruiter Account</div>
            <div className="truncate text-sm font-semibold text-[var(--app-text)]">{user.email}</div>
          </div>

          <nav className="space-y-1">
            <SidebarLink 
              to="/dashboard" 
              active={location.pathname === "/dashboard" || location.pathname === "/dashboard/overview"}
              icon={<Building2 size={20} />} 
              label="Overview" 
            />
            <SidebarLink 
              to="/dashboard/jobs" 
              active={location.pathname === "/dashboard/jobs"}
              icon={<Briefcase size={20} />} 
              label="My Listings" 
            />
            <SidebarLink 
              to="/dashboard/candidates" 
              active={location.pathname === "/dashboard/candidates"}
              icon={<Users size={20} />} 
              label="Talent Pool" 
            />
          </nav>
        </div>

        <div className="mt-auto space-y-4 border-t border-[rgba(41,49,81,0.08)] p-6">
            <Link 
                to="/dashboard/jobs" 
                className="button-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
            >
                <Plus size={18} /> Post a Job
            </Link>
        </div>
      </aside>

      {/* Content Area */}
      <main className="app-workspace flex-1 overflow-y-auto p-5 md:p-8">
        <div className="mx-auto max-w-6xl">
          <Routes>
            <Route path="/" element={<RecruiterOverview user={user} />} />
            <Route path="/overview" element={<RecruiterOverview user={user} />} />
            <Route path="/jobs" element={<RecruiterJobs user={user} />} />
            <Route path="/candidates" element={<RecruiterCandidates user={user} />} />
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
