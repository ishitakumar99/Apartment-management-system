import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge, Empty, ErrorMsg, Field, Modal, PageHeader } from '../components/ui.jsx';

const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const blankFacility = { name: '', icon: '🏟', description: '', openTime: '06:00', closeTime: '22:00' };

export default function Facilities() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // booking modal
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');

  // admin add-facility modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(blankFacility);

  const load = () => {
    api.get('/facilities').then(setFacilities).catch((e) => setError(e.message));
    api.get('/bookings').then(setBookings).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const loadSlots = (f, d) => {
    setSlot('');
    api.get(`/bookings/availability?facility=${f._id}&date=${d}`).then((r) => setSlots(r.slots)).catch((e) => setError(e.message));
  };

  const openBooking = (f) => {
    setSelected(f);
    setDate(todayStr());
    loadSlots(f, todayStr());
  };

  const confirmBooking = async () => {
    try {
      await api.post('/bookings', { facility: selected._id, date, startTime: slot });
      setNotice(`Booked ${selected.name} on ${date} at ${slot}`);
      setSelected(null);
      load();
    } catch (err) {
      setError(err.message);
      loadSlots(selected, date);
    }
  };

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.del(`/bookings/${id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addFacility = async (e) => {
    e.preventDefault();
    try {
      await api.post('/facilities', form);
      setShowAdd(false);
      setForm(blankFacility);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeFacility = async (f) => {
    if (!confirm(`Delete ${f.name} and all its bookings?`)) return;
    try {
      await api.del(`/facilities/${f._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const nowStr = () => new Date();
  const isUpcoming = (b) => b.status === 'booked' && new Date(`${b.date}T${b.startTime}:00`) > nowStr();

  return (
    <>
      <PageHeader
        title="Facilities"
        subtitle="Book courts, games and the club house"
        action={isAdmin && <button className="btn" onClick={() => setShowAdd(true)}>+ Add facility</button>}
      />
      <ErrorMsg error={error} />
      {notice && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{notice}</div>}

      {facilities.length === 0 ? (
        <Empty text="No facilities yet. Run npm run seed in the server folder." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {facilities.map((f) => (
            <div key={f._id} className="card flex flex-col">
              <div className="text-4xl">{f.icon}</div>
              <div className="mt-2 text-lg font-semibold">{f.name}</div>
              <p className="mt-1 flex-1 text-sm text-slate-500">{f.description}</p>
              <p className="mt-2 text-xs text-slate-500">Open {f.openTime} – {f.closeTime} · {f.slotMinutes} min slots</p>
              <div className="mt-3 flex gap-2">
                {user.role === 'resident' && <button className="btn flex-1" onClick={() => openBooking(f)}>Book</button>}
                {isAdmin && <button className="btn-danger" onClick={() => removeFacility(f)}>Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-10 text-lg font-bold">{isAdmin ? 'All bookings' : 'My bookings'}</h2>
      {bookings.length === 0 ? (
        <Empty text="No bookings yet." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {['Facility', ...(isAdmin ? ['Resident'] : []), 'Date', 'Time', 'Status', ''].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{b.facility?.icon} {b.facility?.name}</td>
                  {isAdmin && <td className="px-4 py-3">{b.resident?.name} ({b.resident?.unit})</td>}
                  <td className="px-4 py-3">{b.date}</td>
                  <td className="px-4 py-3">{b.startTime} – {b.endTime}</td>
                  <td className="px-4 py-3"><Badge value={b.status === 'booked' ? 'paid' : 'exited'} /> <span className="ml-1 text-xs capitalize text-slate-500">{b.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    {isUpcoming(b) && <button className="btn-danger" onClick={() => cancel(b._id)}>Cancel</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title={`${selected.icon} Book ${selected.name}`} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <Field label="Date">
              <input
                className="input"
                type="date"
                min={todayStr()}
                value={date}
                onChange={(e) => { setDate(e.target.value); loadSlots(selected, e.target.value); }}
              />
            </Field>
            <div>
              <label className="label">Pick a time slot</label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => {
                  const disabled = s.booked || s.past;
                  const active = slot === s.start;
                  return (
                    <button
                      key={s.start}
                      disabled={disabled}
                      onClick={() => setSlot(s.start)}
                      className={`rounded-xl border px-2 py-2 text-sm font-medium transition ${
                        active ? 'border-brand-600 bg-brand-600 text-white'
                        : disabled ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                        : 'border-slate-300 bg-white hover:border-brand-500'
                      }`}
                    >
                      {s.start}
                      {s.mine && <div className="text-[10px] no-underline">yours</div>}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500">Greyed-out slots are already booked or in the past.</p>
            </div>
            <button className="btn w-full" disabled={!slot} onClick={confirmBooking}>
              {slot ? `Confirm ${slot}` : 'Select a slot'}
            </button>
          </div>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Add facility" onClose={() => setShowAdd(false)}>
          <form onSubmit={addFacility} className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <Field label="Icon"><input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Field>
              <div className="col-span-3"><Field label="Name"><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field></div>
            </div>
            <Field label="Description"><input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Opens"><input className="input" type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} /></Field>
              <Field label="Closes"><input className="input" type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} /></Field>
            </div>
            <button className="btn w-full">Save</button>
          </form>
        </Modal>
      )}
    </>
  );
}
