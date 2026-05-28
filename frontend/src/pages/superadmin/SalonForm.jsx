import { useState, useEffect } from 'react';
import superapi from '../../utils/superapi';
import './SuperAdmin.css';

const EMPTY = {
  name: '', email: '', phone: '', address: '',
  nif: '', persona_contacto: '', numero_cuenta: '',
};

export default function SalonForm({ salon, onSaved, onCancel }) {
  const isEdit = !!salon;
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);
  const [ok, setOk]         = useState(false);

  useEffect(() => {
    if (salon) setForm({
      name:             salon.name || '',
      email:            salon.email || '',
      phone:            salon.phone || '',
      address:          salon.address || '',
      nif:              salon.nif || '',
      persona_contacto: salon.persona_contacto || '',
      numero_cuenta:    salon.numero_cuenta || '',
      active:           salon.active,
    });
    else setForm(EMPTY);
  }, [salon]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await superapi.put(`/salons/${salon.id}`, form);
      } else {
        await superapi.post('/salons', form);
        setOk(true);
        setTimeout(() => { setOk(false); onSaved(); }, 2000);
        return;
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="super-form-card">
      <h2>{isEdit ? `Editar: ${salon.name}` : 'Alta nueva peluquería'}</h2>

      {ok && (
        <div className="super-ok">
          Peluquería registrada. Se ha enviado el email con las credenciales.
        </div>
      )}

      <form onSubmit={handleSubmit} className="super-form-grid">
        <div className="form-group">
          <label>Nombre *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Peluquería Ejemplo" required />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="salon@ejemplo.com" required />
        </div>
        <div className="form-group">
          <label>Teléfono</label>
          <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="600 000 000" />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Calle Mayor 1, Madrid" />
        </div>
        <div className="form-group">
          <label>NIF</label>
          <input value={form.nif} onChange={e => set('nif', e.target.value)} placeholder="B12345678" />
        </div>
        <div className="form-group">
          <label>Persona de contacto</label>
          <input value={form.persona_contacto} onChange={e => set('persona_contacto', e.target.value)} placeholder="Nombre y apellidos" />
        </div>
        <div className="form-group full-width">
          <label>Número de cuenta (IBAN)</label>
          <input value={form.numero_cuenta} onChange={e => set('numero_cuenta', e.target.value)} placeholder="ES00 0000 0000 0000 0000 0000" />
        </div>

        {!isEdit && (
          <p className="super-note full-width">
            Se generará una contraseña automáticamente y se enviará al email indicado.
          </p>
        )}

        {error && <p className="super-error full-width">{error}</p>}

        <div className="super-form-actions full-width">
          <button type="submit" className="super-btn" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Dar de alta'}
          </button>
          <button type="button" className="super-btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
