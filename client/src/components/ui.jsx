import { useEffect } from 'react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

const colors = {
  open: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-indigo-100 text-indigo-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  expected: 'bg-blue-100 text-blue-700',
  inside: 'bg-amber-100 text-amber-700',
  exited: 'bg-slate-100 text-slate-600',
};

export function Badge({ value }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${colors[value] || 'bg-slate-100 text-slate-600'}`}>
      {value}
    </span>
  );
}

export function Empty({ text }) {
  return <div className="card text-center text-sm text-slate-500">{text}</div>;
}

export function ErrorMsg({ error }) {
  if (!error) return null;
  return <div className="mb-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</div>;
}

export const fmtDate = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—');
