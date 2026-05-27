import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';
import './Home.css';

export default function Home() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/salons').then(r => setSalons(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="home-container">
        <section className="hero">
          <h1>✂️ Reserva tu cita online</h1>
          <p>Elige tu peluquería favorita, escoge servicio y hora disponible — ¡en segundos!</p>
        </section>

        <section className="salons-section">
          <h2>Peluquerías disponibles</h2>
          {loading ? (
            <p className="text-muted text-center">Cargando...</p>
          ) : salons.length === 0 ? (
            <p className="text-muted text-center">No hay peluquerías registradas aún.</p>
          ) : (
            <div className="salons-grid">
              {salons.map(s => (
                <Link key={s.id} to={`/reservar/${s.slug}`} className="salon-card">
                  <div className="salon-card-icon">✂️</div>
                  <h3>{s.name}</h3>
                  {s.address && <p className="text-muted">{s.address}</p>}
                  {s.phone   && <p className="text-muted">📞 {s.phone}</p>}
                  <span className="btn btn-primary mt-2">Ver disponibilidad</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
