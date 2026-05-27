import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';
import './Appointments.css';

const STATUSES = ['pendiente', 'confirmada', 'cancelada', 'completada'];

export default function Appointments() {
  const [appts, setAppts]       = useState([]);
  const [filter, setFilter]     = useState({ date: '', status: '' });
  const [loading, setLoading]   = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.date)   params.set('date', filter.date);
    if (filter.status) params.set('status', filter.status);
    api.get(`/appointments?${params}`).then(r => setAppts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const changeStatus = async (id, status) => {
    await api.patch(`/appointments/${id}/status`, { status });
    load();
  };

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 className="page-title">Gestión de citas</h1>

        <div className="filters card mt-2">
          <div className="form-group" style={{marginBottom:0}}>
            <label>Fecha</label>
            <input type="date" value={filter.date} onChange={e => setFilter({...filter, date: e.target.value})} />
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label>Estado</label>
            <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
              <option value="">Todos</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setFilter({date:'',status:''})}>Limpiar</button>
        </div>

        {loading ? (
          <p className="text-muted mt-2">Cargando...</p>
        ) : appts.length === 0 ? (
          <p className="text-muted mt-2">No hay citas con esos filtros.</p>
        ) : (
          <div className="appts-table-wrap card mt-2">
            <table className="appts-table">
              <thead>
                <tr>
                  <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Teléfono</th>
                  <th>Servicio</th><th>Estilista</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appts.map(a => (
                  <tr key={a.id}>
                    <td>{a.appt_date}</td>
                    <td>{a.appt_time?.slice(0,5)}</td>
                    <td>
                      <strong>{a.client_name}</strong>
                      <br /><small className="text-muted">{a.client_email}</small>
                    </td>
                    <td>{a.client_phone || '—'}</td>
                    <td>{a.service_name}<br /><small className="text-muted">{a.duration_minutes} min</small></td>
                    <td>{a.staff_name || '—'}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>
                      <div className="action-btns">
                        {a.status === 'pendiente' && (
                          <button className="btn btn-primary btn-sm" onClick={() => changeStatus(a.id,'confirmada')}>✓ Confirmar</button>
                        )}
                        {a.status !== 'cancelada' && a.status !== 'completada' && (
                          <>
                            {a.status === 'confirmada' && (
                              <button className="btn btn-sm" style={{background:'#e0e7ff',color:'#3730a3'}} onClick={() => changeStatus(a.id,'completada')}>✓ Completar</button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => changeStatus(a.id,'cancelada')}>✕</button>
                          </>
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
    </>
  );
}
