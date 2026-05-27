import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import './SalonPage.css';

export default function SalonPage() {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [salon, setSalon]       = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/salons/${slug}`),
      api.get(`/services/salon/${slug}`),
      api.get(`/staff/salon/${slug}`),
    ]).then(([sRes, svRes, stRes]) => {
      setSalon(sRes.data);
      setServices(svRes.data);
      setStaff(stRes.data);
    }).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="sp-loading">Cargando...</div>;
  if (!salon)  return <div className="sp-loading">Salón no encontrado</div>;

  const brand = salon.brand_color || '#7c3aed';

  const handleBook = () => {
    if (!selected) return;
    navigate(`/reservar/${slug}/cita`, { state: { service: selected } });
  };

  return (
    <div className="sp-root">
      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="sp-hero" style={{
        backgroundImage: salon.cover_url ? `url(${salon.cover_url})` : 'none',
        backgroundColor: brand,
      }}>
        <div className="sp-hero-overlay" style={{ background: `linear-gradient(to bottom, ${brand}99, ${brand}ee)` }} />
        <div className="sp-hero-content">
          {salon.logo_url
            ? <img src={salon.logo_url} alt={salon.name} className="sp-logo" />
            : <div className="sp-logo-placeholder" style={{ background: brand }}>✂️</div>
          }
          <h1>{salon.name}</h1>
          {salon.address && <p className="sp-hero-address">📍 {salon.address}</p>}
          <div className="sp-hero-socials">
            {salon.phone     && <a href={`tel:${salon.phone}`}          className="sp-social-btn">📞 {salon.phone}</a>}
            {salon.whatsapp  && <a href={`https://wa.me/${salon.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="sp-social-btn">💬 WhatsApp</a>}
            {salon.instagram && <a href={`https://instagram.com/${salon.instagram}`}           target="_blank" rel="noreferrer" className="sp-social-btn">📸 Instagram</a>}
            {salon.facebook  && <a href={`https://facebook.com/${salon.facebook}`}             target="_blank" rel="noreferrer" className="sp-social-btn">👍 Facebook</a>}
          </div>
        </div>
      </header>

      {/* ── NAV MINI ─────────────────────────────────────── */}
      <nav className="sp-nav" style={{ borderBottomColor: brand }}>
        <Link to="/" className="sp-nav-back">← Todos los salones</Link>
        <a href="#servicios" className="sp-nav-link" style={{ color: brand }}>Servicios</a>
        {staff.length > 0 && <a href="#equipo" className="sp-nav-link" style={{ color: brand }}>Equipo</a>}
        <a href="#reservar" className="sp-nav-link sp-nav-cta" style={{ background: brand }}>Reservar cita</a>
      </nav>

      <main className="sp-main">
        {/* ── DESCRIPCIÓN ──────────────────────────────────── */}
        {salon.description && (
          <section className="sp-section sp-about">
            <h2 style={{ color: brand }}>Sobre nosotros</h2>
            <p>{salon.description}</p>
          </section>
        )}

        {/* ── SERVICIOS ────────────────────────────────────── */}
        <section className="sp-section" id="servicios">
          <h2 style={{ color: brand }}>Nuestros servicios</h2>
          {services.length === 0
            ? <p className="sp-empty">No hay servicios publicados aún.</p>
            : (
              <div className="sp-services-grid">
                {services.map(sv => (
                  <button
                    key={sv.id}
                    className={`sp-service-card ${selected?.id === sv.id ? 'selected' : ''}`}
                    style={selected?.id === sv.id ? { borderColor: brand, background: `${brand}11` } : {}}
                    onClick={() => setSelected(sv)}
                  >
                    <div className="sp-service-top">
                      <span className="sp-service-name">{sv.name}</span>
                      <span className="sp-service-price" style={{ color: brand }}>{Number(sv.price).toFixed(2)} €</span>
                    </div>
                    {sv.description && <p className="sp-service-desc">{sv.description}</p>}
                    <div className="sp-service-duration">⏱ {sv.duration_minutes} min</div>
                    {selected?.id === sv.id && (
                      <div className="sp-service-check" style={{ color: brand }}>✓ Seleccionado</div>
                    )}
                  </button>
                ))}
              </div>
            )
          }
        </section>

        {/* ── EQUIPO ───────────────────────────────────────── */}
        {staff.length > 0 && (
          <section className="sp-section" id="equipo">
            <h2 style={{ color: brand }}>Nuestro equipo</h2>
            <div className="sp-staff-grid">
              {staff.map(s => (
                <div key={s.id} className="sp-staff-card">
                  {s.photo_url
                    ? <img src={s.photo_url} alt={s.name} className="sp-staff-photo" />
                    : <div className="sp-staff-avatar" style={{ background: `${brand}22`, color: brand }}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                  }
                  <strong>{s.name}</strong>
                  <span className="sp-staff-role">{s.role}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA RESERVAR ─────────────────────────────────── */}
        <section className="sp-section sp-cta-section" id="reservar">
          <div className="sp-cta-box" style={{ borderColor: brand }}>
            <h2 style={{ color: brand }}>¿Lista para tu cita?</h2>
            <p>Elige el servicio que deseas arriba y haz clic en el botón para ver la disponibilidad.</p>
            {selected
              ? <p className="sp-cta-selected">✓ Servicio elegido: <strong>{selected.name}</strong> — {Number(selected.price).toFixed(2)} €</p>
              : <p className="sp-cta-hint">👆 Selecciona primero un servicio de la lista</p>
            }
            <button
              className="sp-cta-btn"
              style={{ background: brand }}
              disabled={!selected}
              onClick={handleBook}
            >
              Ver disponibilidad y reservar →
            </button>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="sp-footer" style={{ background: brand }}>
        <p>© {new Date().getFullYear()} {salon.name}</p>
        {salon.address && <p>{salon.address}</p>}
      </footer>
    </div>
  );
}
