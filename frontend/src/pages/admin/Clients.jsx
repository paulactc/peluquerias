import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';
import './Clients.css';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then(r => {
        // Agrupar por cliente único (nombre + apellidos + teléfono)
        const map = new Map();
        r.data.forEach(a => {
          const key = `${a.client_name}|${a.client_apellidos || ''}|${a.client_phone || ''}`;
          if (!map.has(key)) {
            map.set(key, {
              nombre:    a.client_name,
              apellidos: a.client_apellidos || '',
              telefono:  a.client_phone || '—',
              citas: [],
            });
          }
          map.get(key).citas.push({
            servicio: a.service_name,
            fecha:    a.appt_date,
            estado:   a.status,
          });
        });
        setClients([...map.values()]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.apellidos.toLowerCase().includes(q) ||
      c.telefono.includes(q)
    );
  });

  return (
    <>
      <Navbar />
      <main className="page-container">
        <h1 className="page-title">Clientes</h1>

        <div className="clients-search card mt-2">
          <input
            placeholder="Buscar por nombre, apellidos o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-muted mt-2">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted mt-2">No hay clientes registrados.</p>
        ) : (
          <div className="clients-table-wrap card mt-2">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Apellidos</th>
                  <th>Teléfono</th>
                  <th>Servicios realizados</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.apellidos || '—'}</td>
                    <td>{c.telefono}</td>
                    <td>
                      <div className="services-list">
                        {c.citas.map((cita, j) => (
                          <span key={j} className="service-tag">
                            {cita.servicio} · {cita.fecha}
                          </span>
                        ))}
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
