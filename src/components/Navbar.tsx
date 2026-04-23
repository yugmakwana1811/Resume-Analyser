import { Link, useNavigate } from "react-router-dom";
import { User } from "../App";
import { LogOut, Zap } from "lucide-react";

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
    <nav className="sticky top-0 z-50 border-b border-[rgba(41,49,81,0.08)] bg-[rgba(252,252,253,0.76)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-2xl transition-transform group-hover:rotate-6">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <div className="font-sans text-lg font-semibold tracking-tight text-[var(--app-text)]">ApplyIQ</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--app-text-soft)]">
              Premium Career Intelligence
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-[var(--app-text-muted)] md:flex">
          <Link to="/" className="transition-colors hover:text-[var(--app-text)]">Home</Link>
          {user && (
            <Link to="/dashboard" className="transition-colors hover:text-[var(--app-text)]">Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden rounded-full border border-[rgba(41,49,81,0.08)] bg-white/70 px-3 py-1.5 text-xs text-[var(--app-text-muted)] shadow-sm sm:block">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="rounded-full border border-[rgba(41,49,81,0.08)] bg-white/72 p-2.5 text-[var(--app-text-muted)] shadow-sm transition-all hover:border-[rgba(93,107,255,0.12)] hover:text-[var(--app-text)]"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="button-primary rounded-full px-5 py-2.5 text-sm font-semibold transition-all"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
