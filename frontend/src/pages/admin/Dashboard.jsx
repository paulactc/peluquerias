import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { salon } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get('/salons/me/stats').then(r => setStats(r.data));
    api.get(`/appointments?date=${today}`).then(r => setTodayAppts(r.data));
  }, [today]);

  return (
    <>
      <Navbar />
      <main className="dash-container">
        <h1 className="dash-title">Bienvenida, <span>{salon?.name}</span> 👋</h1>
        <p className="text-muted">Tu enlace público:
          <a href={`/reservar/${salon?.slug}`} target="_blank" rel="noreferrer" className="dash-link">
            /reservar/{salon?.slug}
          </a>
        </p>

        {stats && (
          <div className="stats-grid mt-3">
            <div className="stat-card">
              <span className="stat-value">{stats.today}</span>
              <span className="stat-label">Citas hoy</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pendientes</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total histórico</span>
            </div>
          </div>
        )}

        <div className="quick-links mt-3">
          <Link to="/admin/citas"     className="quick-card">📅 Gestionar citas</Link>
          <Link to="/admin/servicios" className="quick-card">💇 Servicios</Link>
          <Link to="/admin/equipo"    className="quick-card">👥 Equipo</Link>
          <Link to="/admin/perfil"    className="quick-card">⚙️ Perfil del salón</Link>
        </div>

        <section className="mt-3">
          <h2 className="section-h2">Citas de hoy</h2>
          {todayAppts.length === 0 ? (
            <p className="text-muted">No hay citas programadas para hoy.</p>
          ) : (
            <div className="appts-table-wrap card">
              <table className="appts-table">
                <thead>
                  <tr><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Estilista</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {todayAppts.map(a => (
                    <tr key={a.id}>
                      <td>{a.appt_time?.slice(0,5)}</td>
                      <td>{a.client_name}</td>
                      <td>{a.service_name}</td>
                      <td>{a.staff_name || '—'}</td>
                      <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
