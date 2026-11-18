import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge, Empty, ErrorMsg, Field, Modal, PageHeader, fmtDate } from '../components/ui.jsx';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function Bills() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [items, setItems] = useState([]);
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resident: '', month: thisMonth(), amount: 2500 });

  const load = () => api.get('/bills').then(setItems).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    if (isAdmin) api.get('/users?role=resident').then(setResidents).catch(() => {});
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/bills', { ...form, amount: Number(form.amount), resident: form.resident || undefined });
      setNotice(r.message);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const pay = async (id) => {
    try {
      await api.put(`/bills/${id}/pay`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this bill?')) return;
    try {
      await api.del(`/bills/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Maintenance"
        subtitle="Bills and payment status"
        action={isAdmin && <button className="btn" onClick={() => setShowForm(true)}>+ Generate bills</button>}
      />
      <ErrorMsg error={error} />
      {notice && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{notice}</div>}
      {items.length === 0 ? (
        <Empty text="No bills yet." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {['Month', ...(isAdmin ? ['Resident'] : []), 'Unit', 'Amount', 'Status', 'Paid on', ''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{b.month}</td>
                  {isAdmin && <td className="px-4 py-3">{b.resident?.name}</td>}
                  <td className="px-4 py-3">{b.unit}</td>
                  <td className="px-4 py-3">₹{b.amount}</td>
                  <td className="px-4 py-3"><Badge value={b.status} /></td>
                  <td className="px-4 py-3">{fmtDate(b.paidAt)}</td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                    {b.status === 'pending' && <button className="btn" onClick={() => pay(b._id)}>{isAdmin ? 'Mark paid' : 'Pay now'}</button>}
                    {isAdmin && <button className="btn-danger" onClick={() => remove(b._id)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal title="Generate maintenance bills" onClose={() => setShowForm(false)}>
          <form onSubmit={generate} className="space-y-4">
            <Field label="Resident">
              <select className="input" value={form.resident} onChange={(e) => setForm({ ...form, resident: e.target.value })}>
                <option value="">All residents</option>
                {residents.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.unit})</option>)}
              </select>
            </Field>
            <Field label="Month"><input className="input" type="month" required value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></Field>
            <Field label="Amount (₹)"><input className="input" type="number" min="0" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            <button className="btn w-full">Generate</button>
          </form>
        </Modal>
      )}
    </>
  );
}
