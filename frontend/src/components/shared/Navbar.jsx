import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuth, salon, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <nav className="navbar">
      <Link to={isAuth ? '/admin' : '/'} className="navbar-brand">
        ✂️ PeluqueríaSaaS
      </Link>
      <div className="navbar-links">
        {isAuth ? (
          <>
            <span className="navbar-salon">{salon?.name}</span>
            <Link to="/admin">Panel</Link>
            <Link to="/admin/citas">Citas</Link>
            <Link to="/admin/servicios">Servicios</Link>
            <Link to="/admin/equipo">Equipo</Link>
            <Link to="/admin/perfil">Perfil</Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/admin/login" className="btn btn-outline btn-sm">Admin</Link>
          </>
        )}
      </div>
    </nav>
  );
}
