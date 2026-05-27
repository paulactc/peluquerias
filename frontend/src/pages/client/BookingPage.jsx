import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';
import './BookingPage.css';

export default function BookingPage() {
  const { slug }    = useParams();
  const location    = useLocation();
  const navigate    = useNavigate();
  const service     = location.state?.service;

  const [staff, setStaff]         = useState([]);
  const [selectedStaff, setSelStaff] = useState('');
  const [date, setDate]           = useState(new Date());
  const [slots, setSlots]         = useState([]);
  const [selSlot, setSelSlot]     = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState({ client_name: '', client_email: '', client_phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!service) { navigate(`/reservar/${slug}`); return; }
    api.get(`/staff/salon/${slug}`).then(r => setStaff(r.data));
  }, [slug, service, navigate]);

  useEffect(() => {
    if (!service) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    setLoadingSlots(true);
    setSelSlot(null);
    const params = new URLSearchParams({ slug, service_id: service.id, date: dateStr });
    if (selectedStaff) params.append('staff_id', selectedStaff);
    api.get(`/appointments/slots?${params}`).then(r => setSlots(r.data)).finally(() => setLoadingSlots(false));
  }, [date, selectedStaff, service, slug]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selSlot) return setError('Selecciona una hora');
    if (!form.client_name || !form.client_email) return setError('Nombre y email son obligatorios');
    setError('');
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        slug,
        service_id: service.id,
        staff_id: selSlot.staff_id,
        appt_date: format(date, 'yyyy-MM-dd'),
        appt_time: selSlot.time,
        ...form,
      });
      navigate('/confirmacion', { state: { service, date: format(date,'dd/MM/yyyy'), time: selSlot.time, ...form } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reservar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <>
      <Navbar />
      <main className="booking-container">
        <div className="booking-header card">
          <h2>Reservar: <span className="text-primary">{service.name}</span></h2>
          <p className="text-muted">⏱ {service.duration_minutes} min · {Number(service.price).toFixed(2)} €</p>
        </div>

        <div className="booking-grid">
          {/* Columna izquierda: Filtro empleado + Calendario */}
          <div className="col-left">
            {staff.length > 0 && (
              <div className="form-group">
                <label>Estilista (opcional)</label>
                <select value={selectedStaff} onChange={e => setSelStaff(e.target.value)}>
                  <option value="">Cualquier estilista</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <label className="cal-label">Selecciona el día</label>
            <Calendar
              onChange={setDate}
              value={date}
              minDate={new Date()}
              locale="es-ES"
            />
          </div>

          {/* Columna central: Slots */}
          <div className="col-slots">
            <h3>Horas disponibles · {format(date,'dd/MM/yyyy')}</h3>
            {loadingSlots ? (
              <p className="text-muted mt-2">Cargando horarios...</p>
            ) : slots.length === 0 ? (
              <p className="text-muted mt-2">No hay horas disponibles para este día.</p>
            ) : (
              <div className="slots-grid">
                {slots.map((s, i) => (
                  <button
                    key={i}
                    className={`slot-btn ${selSlot === s ? 'active' : ''}`}
                    onClick={() => setSelSlot(s)}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna derecha: Formulario cliente */}
          <div className="col-form">
            <h3>Tus datos</h3>
            <form onSubmit={handleSubmit} className="mt-2">
              <div className="form-group">
                <label>Nombre *</label>
                <input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} placeholder="correo@ejemplo.com" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} placeholder="600 000 000" />
              </div>
              <div className="form-group">
                <label>Notas (opcional)</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Alguna preferencia..." />
              </div>

              {selSlot && (
                <div className="booking-summary">
                  ✅ {service.name} · {format(date,'dd/MM/yyyy')} · {selSlot.time}h
                </div>
              )}
              {error && <p className="booking-error">{error}</p>}

              <button className="btn btn-primary" style={{width:'100%'}} disabled={submitting || !selSlot}>
                {submitting ? 'Reservando...' : 'Confirmar cita'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
