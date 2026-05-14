import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/alerts', label: 'Alerts' },
];

function linkClass({ isActive }: { isActive: boolean }): string {
  return `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes so the new page is visible.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <aside className="hidden md:flex md:w-56 md:flex-col md:sticky md:top-0 md:h-screen bg-slate-900 text-white">
        <div className="px-4 py-5 border-b border-slate-800">
          <h1 className="text-lg font-semibold tracking-wide">SOC</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 space-y-2">
          <p className="text-xs text-slate-400 truncate" title={user?.email}>
            {user?.email ?? '—'}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left cursor-pointer text-sm font-medium text-slate-300 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden bg-slate-900 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-base font-semibold tracking-wide">SOC</h1>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="p-1 rounded-md hover:bg-slate-800 text-lg leading-none"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t border-slate-800">
            <nav className="px-2 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <span
                className="text-xs text-slate-400 truncate"
                title={user?.email}
              >
                {user?.email ?? '—'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-slate-300 hover:text-white whitespace-nowrap"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
