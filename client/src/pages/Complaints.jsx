import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge, Empty, ErrorMsg, Field, Modal, PageHeader, fmtDate } from '../components/ui.jsx';

const categories = ['plumbing', 'electrical', 'security', 'cleaning', 'lift', 'other'];

export default function Complaints() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other' });

  const load = () => api.get('/complaints').then(setItems).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    if (user.role === 'admin') api.get('/users?role=maintenance').then(setStaff).catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', form);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'other' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const update = async (id, body) => {
    try {
      await api.put(`/complaints/${id}`, body);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this complaint?')) return;
    try {
      await api.del(`/complaints/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Complaints"
        subtitle={user.role === 'maintenance' ? 'Complaints assigned to you' : 'Raise and resolve complaints'}
        action={user.role === 'resident' && <button className="btn" onClick={() => setShowForm(true)}>+ Raise complaint</button>}
      />
      <ErrorMsg error={error} />
      {items.length === 0 ? (
        <Empty text="No complaints yet." />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs capitalize text-slate-500">
                    {c.category} · {c.resident?.name} ({c.resident?.unit}) · {fmtDate(c.createdAt)}
                  </div>
                </div>
                <Badge value={c.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{c.description}</p>
              {c.assignedTo && <p className="mt-2 text-xs text-slate-500">Assigned to <b>{c.assignedTo.name}</b></p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {user.role === 'admin' && (
                  <>
                    <select className="input !w-auto !py-1.5" value={c.assignedTo?._id || ''} onChange={(e) => update(c._id, { assignedTo: e.target.value })}>
                      <option value="">Assign to…</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    <select className="input !w-auto !py-1.5" value={c.status} onChange={(e) => update(c._id, { status: e.target.value })}>
                      {['open', 'assigned', 'in-progress', 'resolved'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </>
                )}
                {user.role === 'maintenance' && c.status !== 'resolved' && (
                  <>
                    {c.status !== 'in-progress' && <button className="btn-ghost" onClick={() => update(c._id, { status: 'in-progress' })}>Start work</button>}
                    <button className="btn" onClick={() => update(c._id, { status: 'resolved' })}>Mark resolved</button>
                  </>
                )}
                {(user.role === 'admin' || (user.role === 'resident' && c.status === 'open')) && (
                  <button className="btn-danger" onClick={() => remove(c._id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Raise a complaint" onClose={() => setShowForm(false)}>
          <form onSubmit={create} className="space-y-4">
            <Field label="Title"><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Category">
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Description"><textarea className="input" rows={4} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <button className="btn w-full">Submit</button>
          </form>
        </Modal>
      )}
    </>
  );
}
