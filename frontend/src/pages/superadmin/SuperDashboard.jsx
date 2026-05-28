import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuperAuth } from '../../context/SuperAuthContext';
import superapi from '../../utils/superapi';
import SalonForm from './SalonForm';
import './SuperAdmin.css';

export default function SuperDashboard() {
  const { logout } = useSuperAuth();
  const navigate   = useNavigate();
  const [salons, setSalons]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]  = useState(null);
  const [confirm, setConfirm]  = useState(null);

  const load = () => {
    setLoading(true);
    superapi.get('/salons').then(r => setSalons(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDeactivate = async (id) => {
    await superapi.delete(`/salons/${id}`);
    setConfirm(null);
    load();
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    load();
  };

  return (
    <div className="super-wrap">
      <header className="super-header">
        <div className="super-header-left">
          <span className="super-logo">✂ Peluquería</span>
          <span className="super-badge">Panel Admin</span>
        </div>
        <button className="super-logout" onClick={() => { logout(); navigate('/superadmin/login'); }}>
          Cerrar sesión
        </button>
      </header>

      <main className="super-main">
        <div className="super-top">
          <div>
            <h1>Peluquerías registradas</h1>
            <p className="super-sub">{salons.length} peluquería{salons.length !== 1 ? 's' : ''} en la plataforma</p>
          </div>
          <button className="super-btn-new" onClick={() => { setEditing(null); setShowForm(true); }}>
            + Nueva peluquería
          </button>
        </div>

        {(showForm || editing) && (
          <SalonForm
            salon={editing}
            onSaved={handleSaved}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        )}

        {loading ? (
          <p className="super-muted">Cargando...</p>
        ) : salons.length === 0 ? (
          <p className="super-muted">Aún no hay peluquerías registradas.</p>
        ) : (
          <div className="super-table-wrap">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>NIF</th>
                  <th>Persona contacto</th>
                  <th>Nº cuenta</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {salons.map(s => (
                  <tr key={s.id} className={!s.active ? 'row-inactive' : ''}>
                    <td>
                      <strong>{s.name}</strong>
                      <br /><small className="super-muted">{s.address || '—'}</small>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.nif || '—'}</td>
                    <td>{s.persona_contacto || '—'}</td>
                    <td className="cuenta-cell">{s.numero_cuenta || '—'}</td>
                    <td>
                      <span className={`super-status ${s.active ? 'active' : 'inactive'}`}>
                        {s.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td>
                      <div className="super-actions">
                        <button className="super-btn-edit" onClick={() => { setEditing(s); setShowForm(false); }}>
                          Editar
                        </button>
                        {s.active && (
                          confirm === s.id ? (
                            <>
                              <button className="super-btn-danger" onClick={() => handleDeactivate(s.id)}>Confirmar</button>
                              <button className="super-btn-cancel" onClick={() => setConfirm(null)}>No</button>
                            </>
                          ) : (
                            <button className="super-btn-danger" onClick={() => setConfirm(s.id)}>Desactivar</button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
