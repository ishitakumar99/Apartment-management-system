import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, ErrorMsg } from '../components/ui.jsx';

const tiles = {
  admin: [
    ['residents', 'Residents', '👥'],
    ['openComplaints', 'Open complaints', '🛠'],
    ['resolved', 'Resolved complaints', '✅'],
    ['visitorsInside', 'Visitors inside', '🛡'],
    ['pendingBills', 'Pending bills', '🧾'],
    ['collected', 'Maintenance collected (₹)', '💰'],
  ],
  resident: [
    ['openComplaints', 'My open complaints', '🛠'],
    ['resolved', 'Resolved', '✅'],
    ['pendingBills', 'Pending bills', '🧾'],
    ['activeVisitors', 'Visitors expected / inside', '🛡'],
  ],
  security: [
    ['visitorsInside', 'Visitors inside now', '🛡'],
    ['visitorsToday', 'Visitors today', '📅'],
    ['expectedVisitors', 'Expected visitors', '⏳'],
  ],
  maintenance: [
    ['assigned', 'Newly assigned', '📌'],
    ['inProgress', 'In progress', '🔧'],
    ['resolved', 'Resolved', '✅'],
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats').then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <PageHeader title={`${user.role[0].toUpperCase() + user.role.slice(1)} dashboard`} subtitle="Live overview of your society" />
      <ErrorMsg error={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles[user.role].map(([key, label, icon]) => (
          <div key={key} className="card flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{icon}</div>
            <div>
              <div className="text-sm text-slate-500">{label}</div>
              <div className="text-2xl font-bold">{stats ? stats[key] ?? 0 : '…'}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
