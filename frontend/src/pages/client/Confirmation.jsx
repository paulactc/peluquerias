import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';

export default function Confirmation() {
  const { state } = useLocation();

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 500, margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
        <div className="card">
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ fontWeight: 700, fontSize: '1.6rem', marginBottom: '.5rem' }}>¡Cita confirmada!</h1>
          {state ? (
            <div style={{ margin: '1.2rem 0', lineHeight: 1.8, color: 'var(--color-muted)' }}>
              <p><strong style={{color:'var(--color-text)'}}>Servicio:</strong> {state.service?.name}</p>
              <p><strong style={{color:'var(--color-text)'}}>Fecha:</strong> {state.date} a las {state.time}h</p>
              <p><strong style={{color:'var(--color-text)'}}>Nombre:</strong> {state.client_name}</p>
              <p><strong style={{color:'var(--color-text)'}}>Email:</strong> {state.client_email}</p>
            </div>
          ) : (
            <p className="text-muted mt-2">Tu cita ha sido registrada correctamente.</p>
          )}
          <p className="text-muted" style={{ fontSize: '.85rem', marginTop: '1rem' }}>
            Recibirás los detalles en tu correo. Puedes cancelar llamando al salón.
          </p>
          <Link to="/" className="btn btn-primary mt-3" style={{ display: 'inline-block' }}>
            Volver al inicio
          </Link>
        </div>
      </main>
    </>
  );
}
