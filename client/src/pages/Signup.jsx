import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ErrorMsg, Field } from '../components/ui.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', unit: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-7">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-brand-700">Create resident account</h1>
          <p className="text-sm text-slate-500">Join your society's portal</p>
        </div>
        <ErrorMsg error={error} />
        <Field label="Full name"><input className="input" required value={form.name} onChange={set('name')} /></Field>
        <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} /></Field>
        <Field label="Password"><input className="input" type="password" minLength={6} required value={form.password} onChange={set('password')} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Flat / Unit"><input className="input" required placeholder="A-101" value={form.unit} onChange={set('unit')} /></Field>
          <Field label="Phone"><input className="input" value={form.phone} onChange={set('phone')} /></Field>
        </div>
        <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
        <p className="text-center text-sm text-slate-500">
          Already registered? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
