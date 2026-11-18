import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: '▦', roles: ['admin', 'resident', 'security', 'maintenance'], end: true },
  { to: '/residents', label: 'Residents', icon: '👥', roles: ['admin'] },
  { to: '/complaints', label: 'Complaints', icon: '🛠', roles: ['admin', 'resident', 'maintenance'] },
  { to: '/visitors', label: 'Visitors', icon: '🛡', roles: ['admin', 'resident', 'security'] },
  { to: '/bills', label: 'Maintenance', icon: '💳', roles: ['admin', 'resident'] },
  { to: '/facilities', label: 'Facilities', icon: '🏸', roles: ['admin', 'resident'] },
  { to: '/announcements', label: 'Announcements', icon: '📣', roles: ['admin', 'resident', 'security', 'maintenance'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const items = links.filter((l) => l.roles.includes(user.role));

  const nav = (
    <nav className="mt-6 space-y-1">
      {items.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <span className="w-5 text-center">{l.icon}</span>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="text-xl font-bold text-brand-700">🏢 Smart Society</div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white p-5 shadow-xl">
            <div className="text-xl font-bold text-brand-700">🏢 Smart Society</div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
          <button className="btn-ghost lg:hidden" onClick={() => setOpen(true)}>☰</button>
          <div className="hidden text-sm text-slate-500 lg:block">Welcome back, <b className="text-slate-800">{user.name}</b></div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold capitalize text-brand-700">
              {user.role}{user.unit ? ` · ${user.unit}` : ''}
            </span>
            <button className="btn-ghost" onClick={logout}>Logout</button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
