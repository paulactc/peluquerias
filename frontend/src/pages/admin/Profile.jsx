import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/shared/Navbar';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const TABS = ['general', 'marca', 'redes'];

export default function Profile() {
  const { salon } = useAuth();
  const [tab, setTab]   = useState('general');
  const [form, setForm] = useState({
    name: '', address: '', phone: '',
    logo_url: '', cover_url: '', brand_color: '#7c3aed',
    description: '', instagram: '', facebook: '', whatsapp: '',
  });
  const [msg, setMsg]  = useState('');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api.get('/salons/me/profile').then(r => {
      setForm({
        name:        r.data.name        || '',
        address:     r.data.address     || '',
        phone:       r.data.phone       || '',
        logo_url:    r.data.logo_url    || '',
        cover_url:   r.data.cover_url   || '',
        brand_color: r.data.brand_color || '#7c3aed',
        description: r.data.description || '',
        instagram:   r.data.instagram   || '',
        facebook:    r.data.facebook    || '',
        whatsapp:    r.data.whatsapp    || '',
      });
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    await api.put('/salons/me/profile', form);
    setMsg('¡Cambios guardados!');
    setTimeout(() => setMsg(''), 2500);
  };

  const brand = form.brand_color || '#7c3aed';

  return (
    <>
      <Navbar />
      <main className="profile-container">
        <div className="profile-header">
          <div>
            <h1 className="page-title">Perfil del salón</h1>
            <p className="text-muted" style={{ fontSize: '.9rem' }}>
              URL pública:&nbsp;
              <a href={`/reservar/${salon?.slug}`} target="_blank" rel="noreferrer"
                 style={{ color: brand, fontWeight: 600 }}>
                /reservar/{salon?.slug}
              </a>
            </p>
          </div>
          <a href={`/reservar/${salon?.slug}`} target="_blank" rel="noreferrer"
             className="btn btn-outline btn-sm">
            👁 Ver mi página
          </a>
        </div>

        {msg && <div className="profile-ok">{msg}</div>}

        {/* TABS */}
        <div className="profile-tabs">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`profile-tab ${tab === t ? 'active' : ''}`}
              style={tab === t ? { borderBottomColor: brand, color: brand } : {}}>
              {{ general: '⚙️ General', marca: '🎨 Imagen corporativa', redes: '📱 Redes sociales' }[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="profile-form card">

          {/* ── TAB GENERAL ───────────────────────── */}
          {tab === 'general' && (
            <>
              <div className="form-group">
                <label>Nombre del salón</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Calle, número, ciudad" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="600 000 000" />
                </div>
                <div className="form-group">
                  <label>Email (no editable)</label>
                  <input value={salon?.email || ''} disabled style={{ background: 'var(--color-bg)' }} />
                </div>
              </div>
              <div className="form-group">
                <label>Descripción del salón</label>
                <textarea rows={4} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Cuéntales a tus clientes quiénes sois, vuestra especialidad, años de experiencia..." />
              </div>
            </>
          )}

          {/* ── TAB MARCA ─────────────────────────── */}
          {tab === 'marca' && (
            <>
              <div className="brand-color-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Color principal de tu marca</label>
                  <div className="color-input-wrap">
                    <input type="color" value={form.brand_color}
                      onChange={e => set('brand_color', e.target.value)}
                      className="color-picker" />
                    <input type="text" value={form.brand_color}
                      onChange={e => set('brand_color', e.target.value)}
                      placeholder="#7c3aed" style={{ width: 110 }} />
                    <span className="color-preview" style={{ background: brand }} />
                  </div>
                  <small className="text-muted">Este color se usará en el hero, botones y títulos de tu página</small>
                </div>
              </div>

              <div className="form-group">
                <label>URL del logo</label>
                <input value={form.logo_url} onChange={e => set('logo_url', e.target.value)}
                  placeholder="https://misitio.com/logo.png" />
                <small className="text-muted">Imagen cuadrada o circular, mín. 200×200 px. Aparece en el hero.</small>
                {form.logo_url && (
                  <img src={form.logo_url} alt="logo preview" className="img-preview round"
                    onError={e => e.target.style.display = 'none'} />
                )}
              </div>

              <div className="form-group">
                <label>URL de imagen de portada (banner)</label>
                <input value={form.cover_url} onChange={e => set('cover_url', e.target.value)}
                  placeholder="https://misitio.com/portada.jpg" />
                <small className="text-muted">Imagen horizontal, mín. 1200×400 px. Aparece como fondo del hero.</small>
                {form.cover_url && (
                  <img src={form.cover_url} alt="cover preview" className="img-preview banner"
                    onError={e => e.target.style.display = 'none'} />
                )}
              </div>

              {/* Mini-preview */}
              <div className="mini-preview" style={{ borderColor: brand }}>
                <div className="mp-hero" style={{ background: brand }}>
                  {form.logo_url
                    ? <img src={form.logo_url} className="mp-logo" alt="logo" onError={e => e.target.style.display='none'} />
                    : <div className="mp-logo-ph">✂️</div>
                  }
                  <strong style={{ color: '#fff' }}>{form.name || 'Nombre del salón'}</strong>
                </div>
                <div className="mp-body">
                  <span className="mp-btn" style={{ background: brand }}>Reservar cita</span>
                </div>
                <p className="mp-label">Vista previa del encabezado</p>
              </div>
            </>
          )}

          {/* ── TAB REDES ─────────────────────────── */}
          {tab === 'redes' && (
            <>
              <div className="form-group">
                <label>📸 Instagram (solo el usuario, sin @)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span className="input-prefix">instagram.com/</span>
                  <input value={form.instagram} onChange={e => set('instagram', e.target.value)}
                    placeholder="mipeluqueria" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label>👍 Facebook (usuario o ID de página)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span className="input-prefix">facebook.com/</span>
                  <input value={form.facebook} onChange={e => set('facebook', e.target.value)}
                    placeholder="MiPeluqueria" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label>💬 WhatsApp (número con prefijo internacional)</label>
                <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)}
                  placeholder="34600123456" />
                <small className="text-muted">Ejemplo: 34600123456 (sin + ni espacios)</small>
              </div>

              {(form.instagram || form.facebook || form.whatsapp) && (
                <div className="redes-preview">
                  <p style={{ fontWeight: 600, marginBottom: '.6rem' }}>Así aparecerá en tu página:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                    {form.phone     && <span className="sp-social-btn-demo" style={{ background: brand }}>📞 {form.phone}</span>}
                    {form.whatsapp  && <span className="sp-social-btn-demo" style={{ background: brand }}>💬 WhatsApp</span>}
                    {form.instagram && <span className="sp-social-btn-demo" style={{ background: brand }}>📸 Instagram</span>}
                    {form.facebook  && <span className="sp-social-btn-demo" style={{ background: brand }}>👍 Facebook</span>}
                  </div>
                </div>
              )}
            </>
          )}

          <button className="btn btn-primary mt-2" type="submit" style={{ background: brand }}>
            💾 Guardar cambios
          </button>
        </form>
      </main>
    </>
  );
}
