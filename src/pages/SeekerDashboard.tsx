import { Routes, Route, Link, useLocation } from "react-router-dom";
import { User } from "../App";
import {
  Bookmark,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Map,
  Search,
  Settings,
  Sparkles,
  Zap,
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

const seekerNav = [
  { to: "/dashboard", icon: <LayoutDashboard size={18} aria-hidden="true" />, label: "Overview" },
  { to: "/dashboard/resume", icon: <FileText size={18} aria-hidden="true" />, label: "Resume" },
  { to: "/dashboard/jobs", icon: <Search size={18} aria-hidden="true" />, label: "Matches" },
  { to: "/dashboard/saved", icon: <Bookmark size={18} aria-hidden="true" />, label: "Saved" },
  { to: "/dashboard/roadmap", icon: <Map size={18} aria-hidden="true" />, label: "Roadmap" },
  { to: "/dashboard/tracker", icon: <ClipboardList size={18} aria-hidden="true" />, label: "Tracker" },
  { to: "/dashboard/preferences", icon: <Settings size={18} aria-hidden="true" />, label: "Settings" },
];

export default function SeekerDashboard({ user }: SeekerDashboardProps) {
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="app-shell min-h-[calc(100vh-92px)]">
      <div className="flex min-h-[calc(100vh-92px)]">
        <aside className="app-sidebar hidden w-[18.5rem] flex-col px-5 py-6 lg:flex">
          <div className="accent-surface rounded-[1.75rem] p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-white/75 p-2 text-[var(--app-accent)]">
                <Sparkles size={15} aria-hidden="true" />
              </div>
              <div className="eyebrow">Candidate Space</div>
            </div>
            <div className="truncate text-base font-semibold text-[var(--app-text)]">{user.email}</div>
            <p className="mt-3 text-sm leading-7 text-[var(--app-text-muted)]">
              Keep your profile sharp, monitor role fit, and turn applications into a repeatable system.
            </p>
          </div>

          <nav className="mt-6 space-y-1.5">
            {seekerNav.map((item) => {
              const active =
                item.to === "/dashboard"
                  ? location.pathname === "/dashboard" || location.pathname === "/dashboard/overview"
                  : location.pathname === item.to;
              return <SidebarLink key={item.to} {...item} active={active} />;
            })}
          </nav>

          <div className="mt-auto">
            <div className="section-shell rounded-[1.8rem] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Zap size={15} className="text-[var(--app-accent)]" aria-hidden="true" />
                <span className="eyebrow">Pro Insight</span>
              </div>
              <p className="text-sm leading-7 text-[var(--app-text-muted)]">
                Use the AI roadmap and instructed cover letters together to create a stronger application loop.
              </p>
              <Link
                to="/dashboard/jobs"
                className="button-primary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              >
                Review Matches
              </Link>
            </div>
          </div>
        </aside>

        <main className="app-workspace flex-1 overflow-y-auto px-4 pb-28 pt-4 md:px-6 md:pb-8 md:pt-6">
          <div className="page-frame">
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

      <nav className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <div className="mobile-dock grid grid-cols-4 rounded-[1.75rem] p-2">
          {seekerNav.slice(0, 4).map((item) => {
            const active =
              item.to === "/dashboard"
                ? location.pathname === "/dashboard" || location.pathname === "/dashboard/overview"
                : location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 rounded-[1rem] px-2 py-3 text-[11px] font-semibold ${
                  active ? "nav-link-luxury-active" : "nav-link-luxury"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm font-semibold ${
        active ? "nav-link-luxury-active" : "nav-link-luxury"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
