import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Empty, ErrorMsg, Field, Modal, PageHeader } from '../components/ui.jsx';

const blank = { name: '', email: '', password: '', role: 'resident', unit: '', phone: '' };

export default function Residents() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | user
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => api.get('/users').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const openForm = (u) => {
    setEditing(u || 'new');
    setForm(u ? { ...blank, ...u, password: '' } : blank);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      if (editing === 'new') await api.post('/users', body);
      else await api.put(`/users/${editing._id}`, body);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this user?')) return;
    try {
      await api.del(`/users/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Resident management"
        subtitle="Add, edit and remove residents and staff"
        action={<button className="btn" onClick={() => openForm()}>+ Add user</button>}
      />
      <ErrorMsg error={error} />
      {items.length === 0 ? (
        <Empty text="No users yet." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>{['Name', 'Email', 'Role', 'Unit', 'Phone', ''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">{u.unit || '—'}</td>
                  <td className="px-4 py-3">{u.phone || '—'}</td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                    <button className="btn-ghost" onClick={() => openForm(u)}>Edit</button>
                    <button className="btn-danger" onClick={() => remove(u._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add user' : 'Edit user'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Name"><input className="input" required value={form.name} onChange={set('name')} /></Field>
            <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} /></Field>
            <Field label={editing === 'new' ? 'Password' : 'New password (leave blank to keep)'}>
              <input className="input" type="password" minLength={6} required={editing === 'new'} value={form.password} onChange={set('password')} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <select className="input" value={form.role} onChange={set('role')}>
                  {['resident', 'security', 'maintenance', 'admin'].map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Unit"><input className="input" value={form.unit} onChange={set('unit')} /></Field>
            </div>
            <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
            <button className="btn w-full">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
