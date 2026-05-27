import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Páginas cliente
import Home          from './pages/client/Home';
import SalonPage     from './pages/client/SalonPage';
import BookingPage   from './pages/client/BookingPage';
import Confirmation  from './pages/client/Confirmation';

// Páginas admin
import Login         from './pages/admin/Login';
import Register      from './pages/admin/Register';
import Dashboard     from './pages/admin/Dashboard';
import Appointments  from './pages/admin/Appointments';
import ServicesAdmin from './pages/admin/ServicesAdmin';
import StaffAdmin    from './pages/admin/StaffAdmin';
import Profile       from './pages/admin/Profile';

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Zona pública */}
        <Route path="/"                    element={<Home />} />
        <Route path="/reservar/:slug"      element={<SalonPage />} />
        <Route path="/reservar/:slug/cita" element={<BookingPage />} />
        <Route path="/confirmacion"        element={<Confirmation />} />

        {/* Zona admin */}
        <Route path="/admin/login"    element={<Login />} />
        <Route path="/admin/registro" element={<Register />} />
        <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/citas"     element={<PrivateRoute><Appointments /></PrivateRoute>} />
        <Route path="/admin/servicios" element={<PrivateRoute><ServicesAdmin /></PrivateRoute>} />
        <Route path="/admin/equipo"    element={<PrivateRoute><StaffAdmin /></PrivateRoute>} />
        <Route path="/admin/perfil"    element={<PrivateRoute><Profile /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
