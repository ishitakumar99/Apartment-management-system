import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Complaints from './pages/Complaints.jsx';
import Visitors from './pages/Visitors.jsx';
import Announcements from './pages/Announcements.jsx';
import Bills from './pages/Bills.jsx';
import Residents from './pages/Residents.jsx';
import Facilities from './pages/Facilities.jsx';

function Protected({ roles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-slate-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/complaints" element={<Protected roles={['admin', 'resident', 'maintenance']}><Complaints /></Protected>} />
        <Route path="/visitors" element={<Protected roles={['admin', 'resident', 'security']}><Visitors /></Protected>} />
        <Route path="/bills" element={<Protected roles={['admin', 'resident']}><Bills /></Protected>} />
        <Route path="/facilities" element={<Protected roles={['admin', 'resident']}><Facilities /></Protected>} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/residents" element={<Protected roles={['admin']}><Residents /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
