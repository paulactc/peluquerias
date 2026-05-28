import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SuperAuthProvider, useSuperAuth } from './context/SuperAuthContext';

// Páginas cliente
import Home          from './pages/client/Home';
import SalonPage     from './pages/client/SalonPage';
import BookingPage   from './pages/client/BookingPage';
import Confirmation  from './pages/client/Confirmation';

// Páginas admin (peluquería)
import Login         from './pages/admin/Login';
import Dashboard     from './pages/admin/Dashboard';
import Appointments  from './pages/admin/Appointments';
import ServicesAdmin from './pages/admin/ServicesAdmin';
import StaffAdmin    from './pages/admin/StaffAdmin';
import Profile       from './pages/admin/Profile';
import Clients       from './pages/admin/Clients';

// Páginas superadmin
import SuperLogin     from './pages/superadmin/SuperLogin';
import SuperDashboard from './pages/superadmin/SuperDashboard';

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/admin/login" replace />;
}

function SuperPrivateRoute({ children }) {
  const { isAuth } = useSuperAuth();
  return isAuth ? children : <Navigate to="/superadmin/login" replace />;
}

export default function App() {
  return (
    <SuperAuthProvider>
      <AuthProvider>
        <Routes>
          {/* Zona pública */}
          <Route path="/"                    element={<Home />} />
          <Route path="/reservar/:slug"      element={<SalonPage />} />
          <Route path="/reservar/:slug/cita" element={<BookingPage />} />
          <Route path="/confirmacion"        element={<Confirmation />} />

          {/* Zona admin peluquería */}
          <Route path="/admin/login"    element={<Login />} />
          <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/admin/citas"     element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/admin/clientes"  element={<PrivateRoute><Clients /></PrivateRoute>} />
          <Route path="/admin/servicios" element={<PrivateRoute><ServicesAdmin /></PrivateRoute>} />
          <Route path="/admin/equipo"    element={<PrivateRoute><StaffAdmin /></PrivateRoute>} />
          <Route path="/admin/perfil"    element={<PrivateRoute><Profile /></PrivateRoute>} />

          {/* Zona superadmin */}
          <Route path="/superadmin/login" element={<SuperLogin />} />
          <Route path="/superadmin"       element={<SuperPrivateRoute><SuperDashboard /></SuperPrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </SuperAuthProvider>
  );
}
