import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Empty, ErrorMsg, Field, Modal, PageHeader, fmtDate } from '../components/ui.jsx';

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | announcement
  const [form, setForm] = useState({ title: '', message: '' });
  const isAdmin = user.role === 'admin';

  const load = () => api.get('/announcements').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const openForm = (a) => {
    setEditing(a || 'new');
    setForm(a ? { title: a.title, message: a.message } : { title: '', message: '' });
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') await api.post('/announcements', form);
      else await api.put(`/announcements/${editing._id}`, form);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.del(`/announcements/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Society notices and updates"
        action={isAdmin && <button className="btn" onClick={() => openForm()}>+ New announcement</button>}
      />
      <ErrorMsg error={error} />
      {items.length === 0 ? (
        <Empty text="No announcements yet." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-slate-500">{a.author?.name} · {fmtDate(a.createdAt)}</div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button className="btn-ghost" onClick={() => openForm(a)}>Edit</button>
                    <button className="btn-danger" onClick={() => remove(a._id)}>Delete</button>
                  </div>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{a.message}</p>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'New announcement' : 'Edit announcement'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Title"><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Message"><textarea className="input" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
            <button className="btn w-full">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
