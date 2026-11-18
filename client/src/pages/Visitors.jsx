import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge, Empty, ErrorMsg, Field, Modal, PageHeader, fmtDate } from '../components/ui.jsx';

const blank = { name: '', phone: '', purpose: '', unit: '', type: 'guest' };

export default function Visitors() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const isResident = user.role === 'resident';
  const staff = user.role === 'admin' || user.role === 'security';

  const load = () => api.get('/visitors').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const act = async (fn) => {
    try {
      await fn();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const create = (e) => {
    e.preventDefault();
    act(async () => {
      await api.post('/visitors', form);
      setShowForm(false);
      setForm(blank);
    });
  };

  return (
    <>
      <PageHeader
        title="Visitor management"
        subtitle="Entry and exit records"
        action={<button className="btn" onClick={() => setShowForm(true)}>{isResident ? '+ Pre-register visitor' : '+ Log entry'}</button>}
      />
      <ErrorMsg error={error} />
      {items.length === 0 ? (
        <Empty text="No visitor records yet." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {['Visitor', 'Unit', 'Type', 'Entry', 'Exit', 'Status', ''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.phone} {v.purpose && `· ${v.purpose}`}</div>
                  </td>
                  <td className="px-4 py-3">{v.unit}</td>
                  <td className="px-4 py-3 capitalize">{v.type}</td>
                  <td className="px-4 py-3">{fmtDate(v.entryTime)}</td>
                  <td className="px-4 py-3">{fmtDate(v.exitTime)}</td>
                  <td className="px-4 py-3"><Badge value={v.status} /></td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                    {staff && v.status === 'expected' && <button className="btn-ghost" onClick={() => act(() => api.put(`/visitors/${v._id}/entry`))}>Check in</button>}
                    {staff && v.status === 'inside' && <button className="btn-ghost" onClick={() => act(() => api.put(`/visitors/${v._id}/exit`))}>Mark exit</button>}
                    {user.role === 'admin' && <button className="btn-danger" onClick={() => confirm('Delete record?') && act(() => api.del(`/visitors/${v._id}`))}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title={isResident ? 'Pre-register visitor' : 'Log visitor entry'} onClose={() => setShowForm(false)}>
          <form onSubmit={create} className="space-y-4">
            <Field label="Visitor name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Phone"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            {!isResident && <Field label="Visiting unit"><input className="input" required placeholder="A-101" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></Field>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {['guest', 'delivery', 'service'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Purpose"><input className="input" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></Field>
            </div>
            <button className="btn w-full">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
