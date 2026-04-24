import { Link, useNavigate } from "react-router-dom";
import { User } from "../App";
import { ArrowRight, LayoutGrid, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 md:px-6">
      <div className="page-frame topbar-glass flex items-center justify-between rounded-[1.75rem] px-4 py-3 md:px-5">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <div className="brand-mark transition-premium flex h-11 w-11 items-center justify-center rounded-2xl group-hover:-translate-y-0.5 group-hover:rotate-3">
            <Zap size={18} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-sans text-lg font-semibold tracking-tight text-[var(--app-text)]">ApplyIQ</div>
            <div className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--app-text-soft)]">
              Precision Hiring OS
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Home</Link>
          </Button>
          {user && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
              <LayoutGrid size={16} aria-hidden="true" />
              Dashboard
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="status-chip hidden rounded-full px-3 py-1.5 text-xs sm:block">
                {user.email}
              </span>
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="icon"
                className="text-[var(--app-text-muted)]"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={18} aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <Button asChild variant="default" size="sm" className="px-5 py-2.5">
              <Link to="/auth">
                Get Started <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
