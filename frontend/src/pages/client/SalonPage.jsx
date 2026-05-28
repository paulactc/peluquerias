import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import api from '../../utils/api';
import './SalonPage.css';

const STEPS = { SERVICE: 1, DATETIME: 2, FORM: 3, OK: 4 };

export default function SalonPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();

  const [salon, setSalon]       = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

  // Booking state
  const [step, setStep]           = useState(STEPS.SERVICE);
  const [selected, setSelected]   = useState(null);
  const [date, setDate]           = useState(new Date());
  const [slots, setSlots]         = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selSlot, setSelSlot]     = useState(null);
  const [form, setForm]           = useState({ client_name: '', client_apellidos: '', client_phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/salons/${slug}`),
      api.get(`/services/salon/${slug}`),
    ]).then(([sRes, svRes]) => {
      setSalon(sRes.data);
      setServices(svRes.data);
    }).finally(() => setLoading(false));
  }, [slug]);

  // Cargar slots cuando cambia fecha o servicio
  useEffect(() => {
    if (!selected || step !== STEPS.DATETIME) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    setLoadingSlots(true);
    setSelSlot(null);
    const params = new URLSearchParams({ slug, service_id: selected.id, date: dateStr });
    api.get(`/appointments/slots?${params}`)
      .then(r => setSlots(r.data))
      .finally(() => setLoadingSlots(false));
  }, [date, selected, step, slug]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.client_name || !form.client_apellidos || !form.client_phone)
      return setError('Nombre, apellidos y teléfono son obligatorios');
    setError('');
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        slug,
        service_id: selected.id,
        staff_id: selSlot.staff_id,
        appt_date: format(date, 'yyyy-MM-dd'),
        appt_time: selSlot.time,
        ...form,
      });
      setStep(STEPS.OK);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reservar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="sp-loading">Cargando...</div>;
  if (!salon)  return <div className="sp-loading">Salón no encontrado</div>;

  const brand = salon.brand_color || '#7c3aed';

  return (
    <div className="sp-root">

      {/* ── FONDO: info del salón ──────────────────────────────────── */}
      <div
        className="sp-bg"
        style={{
          backgroundImage: salon.cover_url ? `url(${salon.cover_url})` : 'none',
          backgroundColor: brand,
        }}
      >
        <div className="sp-bg-overlay" style={{ background: `linear-gradient(135deg, ${brand}dd 0%, ${brand}99 100%)` }} />
        <div className="sp-bg-content">
          <Link to="/" className="sp-back-link">← Volver</Link>

          {salon.logo_url
            ? <img src={salon.logo_url} alt={salon.name} className="sp-logo" />
            : <div className="sp-logo-placeholder">✂</div>
          }

          <h1 className="sp-name">{salon.name}</h1>

          {salon.address && (
            <p className="sp-address">📍 {salon.address}</p>
          )}

          {salon.description && (
            <p className="sp-description">{salon.description}</p>
          )}

          <div className="sp-socials">
            {salon.phone    && <a href={`tel:${salon.phone}`} className="sp-social">📞 {salon.phone}</a>}
            {salon.whatsapp && <a href={`https://wa.me/${salon.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="sp-social">💬 WhatsApp</a>}
            {salon.instagram && <a href={`https://instagram.com/${salon.instagram}`} target="_blank" rel="noreferrer" className="sp-social">📸 Instagram</a>}
          </div>
        </div>
      </div>

      {/* ── PRIMER PLANO: panel de reserva ────────────────────────── */}
      <div className="sp-booking-panel">

        {/* Paso 1: Elige servicio */}
        {step === STEPS.SERVICE && (
          <div className="sp-panel-inner">
            <h2 className="sp-panel-title" style={{ color: brand }}>Reserva tu cita</h2>
            <p className="sp-panel-sub">Elige el servicio que deseas</p>

            {services.length === 0 ? (
              <p className="sp-empty">No hay servicios disponibles aún.</p>
            ) : (
              <div className="sp-service-list">
                {services.map(sv => (
                  <button
                    key={sv.id}
                    className={`sp-service-item ${selected?.id === sv.id ? 'active' : ''}`}
                    style={selected?.id === sv.id ? { borderColor: brand, background: `${brand}11` } : {}}
                    onClick={() => setSelected(sv)}
                  >
                    <div className="sp-si-left">
                      <span className="sp-si-name">{sv.name}</span>
                      {sv.description && <span className="sp-si-desc">{sv.description}</span>}
                      <span className="sp-si-dur">⏱ {sv.duration_minutes} min</span>
                    </div>
                    <span className="sp-si-price" style={{ color: brand }}>{Number(sv.price).toFixed(2)} €</span>
                  </button>
                ))}
              </div>
            )}

            <button
              className="sp-next-btn"
              style={{ background: brand }}
              disabled={!selected}
              onClick={() => setStep(STEPS.DATETIME)}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Paso 2: Elige día y hora */}
        {step === STEPS.DATETIME && (
          <div className="sp-panel-inner">
            <button className="sp-back-step" onClick={() => setStep(STEPS.SERVICE)}>← Cambiar servicio</button>
            <div className="sp-selected-service" style={{ background: `${brand}15`, borderColor: brand }}>
              <strong>{selected.name}</strong>
              <span>{Number(selected.price).toFixed(2)} € · {selected.duration_minutes} min</span>
            </div>

            <h3 className="sp-section-label">Elige el día</h3>
            <Calendar
              onChange={setDate}
              value={date}
              minDate={new Date()}
              locale="es-ES"
              className="sp-calendar"
            />

            <h3 className="sp-section-label" style={{ marginTop: '1.2rem' }}>
              Horas disponibles · {format(date, 'dd/MM/yyyy')}
            </h3>

            {loadingSlots ? (
              <p className="sp-muted">Cargando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="sp-muted">No hay horas disponibles para este día.</p>
            ) : (
              <div className="sp-slots-grid">
                {slots.map((s, i) => (
                  <button
                    key={i}
                    className={`sp-slot ${selSlot === s ? 'active' : ''}`}
                    style={selSlot === s ? { background: brand, borderColor: brand } : {}}
                    onClick={() => setSelSlot(s)}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}

            <button
              className="sp-next-btn"
              style={{ background: brand }}
              disabled={!selSlot}
              onClick={() => setStep(STEPS.FORM)}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Paso 3: Datos del cliente */}
        {step === STEPS.FORM && (
          <div className="sp-panel-inner">
            <button className="sp-back-step" onClick={() => setStep(STEPS.DATETIME)}>← Cambiar fecha</button>

            <div className="sp-selected-service" style={{ background: `${brand}15`, borderColor: brand }}>
              <strong>{selected.name}</strong>
              <span>{format(date, 'dd/MM/yyyy')} · {selSlot.time}h</span>
            </div>

            <h3 className="sp-section-label">Tus datos</h3>
            <form onSubmit={handleSubmit} className="sp-form">
              <div className="sp-field">
                <label>Nombre *</label>
                <input
                  value={form.client_name}
                  onChange={e => setForm({ ...form, client_name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="sp-field">
                <label>Apellidos *</label>
                <input
                  value={form.client_apellidos}
                  onChange={e => setForm({ ...form, client_apellidos: e.target.value })}
                  placeholder="Tus apellidos"
                />
              </div>
              <div className="sp-field">
                <label>Teléfono *</label>
                <input
                  value={form.client_phone}
                  onChange={e => setForm({ ...form, client_phone: e.target.value })}
                  placeholder="600 000 000"
                  type="tel"
                />
              </div>

              {error && <p className="sp-error">{error}</p>}

              <button
                type="submit"
                className="sp-next-btn"
                style={{ background: brand }}
                disabled={submitting}
              >
                {submitting ? 'Reservando...' : 'Confirmar cita'}
              </button>
            </form>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {step === STEPS.OK && (
          <div className="sp-panel-inner sp-confirm">
            <div className="sp-confirm-icon" style={{ color: brand }}>✓</div>
            <h2 style={{ color: brand }}>¡Cita confirmada!</h2>
            <p>Tu cita ha sido reservada con éxito.</p>
            <div className="sp-confirm-detail">
              <span><strong>Servicio:</strong> {selected.name}</span>
              <span><strong>Día:</strong> {format(date, 'dd/MM/yyyy')}</span>
              <span><strong>Hora:</strong> {selSlot.time}h</span>
              <span><strong>Nombre:</strong> {form.client_name} {form.client_apellidos}</span>
            </div>
            <button
              className="sp-next-btn"
              style={{ background: brand }}
              onClick={() => { setStep(STEPS.SERVICE); setSelected(null); setSelSlot(null); setForm({ client_name: '', client_apellidos: '', client_phone: '' }); }}
            >
              Reservar otra cita
            </button>
          </div>
        )}

        {/* Indicador de pasos */}
        {step !== STEPS.OK && (
          <div className="sp-steps">
            {[1,2,3].map(n => (
              <div key={n} className={`sp-step-dot ${step >= n ? 'done' : ''}`} style={step >= n ? { background: brand } : {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
