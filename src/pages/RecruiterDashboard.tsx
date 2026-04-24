import { Routes, Route, Link, useLocation } from "react-router-dom";
import { User } from "../App";
import { Briefcase, Building2, Plus, TrendingUp, Users } from "lucide-react";
import RecruiterOverview from "./recruiter/RecruiterOverview";
import RecruiterJobs from "./recruiter/RecruiterJobs";
import RecruiterCandidates from "./recruiter/RecruiterCandidates";

interface RecruiterDashboardProps {
  user: User;
}

const recruiterNav = [
  { to: "/dashboard", icon: <Building2 size={18} aria-hidden="true" />, label: "Overview" },
  { to: "/dashboard/jobs", icon: <Briefcase size={18} aria-hidden="true" />, label: "Listings" },
  { to: "/dashboard/candidates", icon: <Users size={18} aria-hidden="true" />, label: "Candidates" },
];

export default function RecruiterDashboard({ user }: RecruiterDashboardProps) {
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-92px)]">
      <div className="flex min-h-[calc(100vh-92px)]">
        <aside className="app-sidebar hidden w-[19rem] flex-col px-5 py-6 lg:flex">
          <div className="accent-surface rounded-[1.75rem] p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-white/75 p-2 text-[var(--app-accent)]">
                <TrendingUp size={15} aria-hidden="true" />
              </div>
              <div className="eyebrow">Recruiter Space</div>
            </div>
            <div className="truncate text-base font-semibold text-[var(--app-text)]">{user.email}</div>
            <p className="mt-3 text-sm leading-7 text-[var(--app-text-muted)]">
              Review listing performance, candidate movement, and hiring momentum from one operating surface.
            </p>
          </div>

          <nav className="mt-6 space-y-1.5">
            {recruiterNav.map((item) => {
              const active =
                item.to === "/dashboard"
                  ? location.pathname === "/dashboard" || location.pathname === "/dashboard/overview"
                  : location.pathname === item.to;
              return <SidebarLink key={item.to} {...item} active={active} />;
            })}
          </nav>

          <div className="mt-auto">
            <Link
              to="/dashboard/jobs"
              className="button-primary flex items-center justify-center gap-2 rounded-[1.2rem] px-4 py-3 text-sm font-semibold"
            >
              <Plus size={18} aria-hidden="true" />
              Post a New Role
            </Link>
          </div>
        </aside>

        <main className="app-workspace flex-1 overflow-y-auto px-4 pb-24 pt-4 md:px-6 md:pb-8 md:pt-6">
          <div className="page-frame">
            <Routes>
              <Route path="/" element={<RecruiterOverview user={user} />} />
              <Route path="/overview" element={<RecruiterOverview user={user} />} />
              <Route path="/jobs" element={<RecruiterJobs user={user} />} />
              <Route path="/candidates" element={<RecruiterCandidates user={user} />} />
            </Routes>
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <div className="mobile-dock grid grid-cols-3 rounded-[1.75rem] p-2">
          {recruiterNav.map((item) => {
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
